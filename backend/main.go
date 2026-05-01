package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"github.com/google/uuid"
	"google.golang.org/api/option"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

type Snippet struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Code      string    `json:"code"`
	CreatedAt time.Time `json:"created_at"`
}

type Event struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Type      string    `json:"type"`      // run, share, fix
	Status    string    `json:"status"`    // success, error
	Metadata  string    `json:"metadata"`  // JSON string for extra info like lesson_id
	CreatedAt time.Time `json:"created_at"`
}

var db *gorm.DB

func initDB() {
	var err error
	dbURL := os.Getenv("TURSO_DB_URL")
	dbToken := os.Getenv("TURSO_DB_TOKEN")

	var dsn string
	if dbURL != "" {
		// Turso connection: use libsql driver
		dsn = fmt.Sprintf("%s?authToken=%s", dbURL, dbToken)
		db, err = gorm.Open(sqlite.Dialector{
			DriverName: "libsql",
			DSN:        dsn,
		}, &gorm.Config{})
		log.Printf("Connecting to Turso: %s", dbURL)
	} else {
		// Local fallback
		db, err = gorm.Open(sqlite.Open("snippets.db"), &gorm.Config{})
		log.Printf("Connecting to local SQLite: snippets.db")
	}

	if err != nil {
		log.Fatal("failed to connect database:", err)
	}

	// Enable WAL mode for better concurrency (primarily for local, harmless on Turso)
	db.Exec("PRAGMA journal_mode = WAL;")

	db.AutoMigrate(&Snippet{}, &Event{})
}

func logEvent(eventType, status, metadata string) {
	db.Create(&Event{
		Type:     eventType,
		Status:   status,
		Metadata: metadata,
	})
}

func main() {
	initDB()

	r := gin.Default()
	r.Use(cors.Default())

	r.POST("/run", handleRun)
	r.POST("/share", handleShare)
	r.GET("/p/:id", handleGetSnippet)
	r.POST("/fix", handleFix)
	r.GET("/insights", handleInsights)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}

func handleRun(c *gin.Context) {
	var req struct {
		Code     string `json:"code"`
		LessonID string `json:"lesson_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create temp directory for execution
	runID := uuid.New().String()
	tmpDir := filepath.Join(os.TempDir(), "mojo-run-"+runID)
	if err := os.MkdirAll(tmpDir, 0755); err != nil {
		logEvent("run", "error", req.LessonID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create temp dir"})
		return
	}
	defer os.RemoveAll(tmpDir)

	codePath := filepath.Join(tmpDir, "main.mojo")
	if err := os.WriteFile(codePath, []byte(req.Code), 0644); err != nil {
		logEvent("run", "error", req.LessonID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to write code file"})
		return
	}

	// Ensure a global cache directory exists for Mojo to speed up compilation
	cacheDir := filepath.Join(os.TempDir(), "mojo-cache")
	os.MkdirAll(cacheDir, 0755)

	var cmd *exec.Cmd
	if os.Getenv("MOJO_LOCAL") == "true" {
		// Production: Execute mojo directly (faster, works on Cloud Run)
		cmd = exec.Command("mojo", "run", codePath)
		cmd.Env = append(os.Environ(), "MODULAR_HOME=/root/.modular")
	} else {
		// Development: Execute in Docker
		cmd = exec.Command("docker", "run", "--rm",
			"--network", "none",
			"--memory", "512m",
			"--cpus", "0.5",
			"-v", tmpDir+":/app",
			"-v", cacheDir+":/root/.modular",
			"mojo-runner", "mojo", "run", "/app/main.mojo")
	}

	output, err := cmd.CombinedOutput()
	
	status := "success"
	if err != nil {
		status = "error"
	}
	logEvent("run", status, req.LessonID)

	response := gin.H{
		"output": string(output),
	}
	if err != nil && string(output) == "" {
		response["error"] = err.Error()
	}

	c.JSON(http.StatusOK, response)
}

func handleInsights(c *gin.Context) {
	var totalRuns, totalShares, totalFixes int64
	var runSuccess, runError int64

	if err := db.Model(&Event{}).Where("type = ?", "run").Count(&totalRuns).Error; err != nil {
		log.Printf("Error counting runs: %v", err)
	}
	db.Model(&Event{}).Where("type = ?", "share").Count(&totalShares)
	db.Model(&Event{}).Where("type = ?", "fix").Count(&totalFixes)
	
	db.Model(&Event{}).Where("type = ? AND status = ?", "run", "success").Count(&runSuccess)
	db.Model(&Event{}).Where("type = ? AND status = ?", "run", "error").Count(&runError)

	// Get popular lessons with success/error breakdown
	type LessonStat struct {
		LessonID string `json:"lesson_id"`
		Success  int    `json:"success"`
		Error    int    `json:"error"`
		Total    int    `json:"total"`
	}
	var lessonStats []LessonStat
	if err := db.Raw(`
		SELECT 
			metadata as lesson_id,
			SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
			SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error,
			COUNT(*) as total
		FROM events 
		WHERE type = 'run' 
		GROUP BY metadata 
		ORDER BY total DESC 
		LIMIT 10
	`).Scan(&lessonStats).Error; err != nil {
		log.Printf("Error querying lesson stats: %v", err)
	}

	// Last 7 days activity
	type DayActivity struct {
		Date  string `json:"date"`
		Count int    `json:"count"`
	}
	var dailyUsage []DayActivity
	if err := db.Raw(`
		SELECT date(created_at) as date, count(*) as count 
		FROM events 
		WHERE created_at > ? 
		GROUP BY date 
		ORDER BY date ASC
	`, time.Now().AddDate(0, 0, -7)).Scan(&dailyUsage).Error; err != nil {
		log.Printf("Error querying daily usage: %v", err)
	}

	// Last 24 hours activity
	var last24h int64
	db.Model(&Event{}).Where("created_at > ?", time.Now().Add(-24*time.Hour)).Count(&last24h)

	c.JSON(http.StatusOK, gin.H{
		"totals": gin.H{
			"runs":   totalRuns,
			"shares": totalShares,
			"fixes":  totalFixes,
		},
		"run_stats": gin.H{
			"success": runSuccess,
			"error":   runError,
		},
		"lesson_stats": lessonStats,
		"daily_usage":  dailyUsage,
		"activity_24h": last24h,
	})
}

func handleShare(c *gin.Context) {
	var req struct {
		Code string `json:"code"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	snippet := Snippet{
		ID:        uuid.New().String()[:8], // Short ID for sharing
		Code:      req.Code,
		CreatedAt: time.Now(),
	}

	if err := db.Create(&snippet).Error; err != nil {
		logEvent("share", "error", "")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save snippet"})
		return
	}

	logEvent("share", "success", snippet.ID)
	c.JSON(http.StatusOK, snippet)
}

func handleGetSnippet(c *gin.Context) {
	id := c.Param("id")
	var snippet Snippet
	if err := db.First(&snippet, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "snippet not found"})
		return
	}

	c.JSON(http.StatusOK, snippet)
}

func handleFix(c *gin.Context) {
	var req struct {
		Code  string `json:"code"`
		Error string `json:"error"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	apiKey := os.Getenv("GOOGLE_API_KEY")
	if apiKey == "" {
		logEvent("fix", "error", "no_api_key")
		c.JSON(http.StatusOK, gin.H{
			"fixed_code":  req.Code,
			"explanation": "I've analyzed the error, but the GOOGLE_API_KEY is not set. Please provide a valid key to enable AI fixes.",
			"agent_note":  "Developer hint: Run the backend with GOOGLE_API_KEY=your_key",
		})
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		logEvent("fix", "error", "client_failure")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to connect to AI service"})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	prompt := fmt.Sprintf(`You are a Mojo programming language expert.
Fix the following Mojo code based on the error provided. 

CRITICAL MODERN STANDARD: 
In modern Mojo (v26.2+), the "fn" keyword is deprecated. 
ALWAYS use the unified "def" keyword for all functions, including "def main()".
Modern "def" is strict and high-performance when type annotations are provided.

Return your response in JSON format with two fields: "fixed_code" (string) and "explanation" (string).
Do not include any markdown formatting or code blocks in the JSON fields.

Code:
%s

Error:
%s`, req.Code, req.Error)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		logEvent("fix", "error", "genai_failure")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI generation failed: " + err.Error()})
		return
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		logEvent("fix", "error", "empty_response")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "empty response from AI"})
		return
	}

	// Simple extraction of text from the first part
	respText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	
	// Clean up JSON response if model included markdown blocks
	cleanText := strings.TrimSpace(respText)
	cleanText = strings.TrimPrefix(cleanText, "```json")
	cleanText = strings.TrimSuffix(cleanText, "```")
	cleanText = strings.TrimSpace(cleanText)

	logEvent("fix", "success", "")
	// We pass it directly back to the frontend
	c.Header("Content-Type", "application/json")
	c.String(http.StatusOK, cleanText)
}
