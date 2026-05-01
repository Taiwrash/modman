package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/spf13/cobra"
)

var apiBaseURL string

func main() {
	var rootCmd = &cobra.Command{
		Use:   "modman",
		Short: "modman - A modern manager for Mojo",
	}

	rootCmd.PersistentFlags().StringVar(&apiBaseURL, "url", "http://localhost:8080", "Base URL for the Mojo Playground API")

	var runCmd = &cobra.Command{
		Use:   "run [file]",
		Short: "Run a Mojo file remotely in the sandbox",
		Args:  cobra.ExactArgs(1),
		Run:   runMojo,
	}

	var shareCmd = &cobra.Command{
		Use:   "share [file]",
		Short: "Share a Mojo file and get a playground URL",
		Args:  cobra.ExactArgs(1),
		Run:   shareMojo,
	}

	var fixCmd = &cobra.Command{
		Use:   "fix [file] [error]",
		Short: "Use AI to fix Mojo code based on an error",
		Args:  cobra.ExactArgs(2),
		Run:   fixMojo,
	}

	rootCmd.AddCommand(runCmd, shareCmd, fixCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func runMojo(cmd *cobra.Command, args []string) {
	code, err := os.ReadFile(args[0])
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		return
	}

	payload := map[string]string{"code": string(code)}
	respBody := callAPI("/run", payload)

	var result struct {
		Output string `json:"output"`
		Error  string `json:"error"`
	}
	json.Unmarshal(respBody, &result)

	if result.Error != "" {
		fmt.Printf("Error: %s\n", result.Error)
	}
	fmt.Println(result.Output)
}

func shareMojo(cmd *cobra.Command, args []string) {
	code, err := os.ReadFile(args[0])
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		return
	}

	payload := map[string]string{"code": string(code)}
	respBody := callAPI("/share", payload)

	var result struct {
		ID string `json:"id"`
	}
	json.Unmarshal(respBody, &result)

	fmt.Printf("Snippet shared successfully!\nURL: %s/p/%s\n", apiBaseURL, result.ID)
}

func fixMojo(cmd *cobra.Command, args []string) {
	filePath := args[0]
	errMsg := args[1]

	code, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		return
	}

	payload := map[string]string{
		"code":  string(code),
		"error": errMsg,
	}
	respBody := callAPI("/fix", payload)

	var result struct {
		FixedCode   string `json:"fixed_code"`
		Explanation string `json:"explanation"`
	}
	json.Unmarshal(respBody, &result)

	fmt.Printf("\n--- AI Explanation ---\n%s\n", result.Explanation)
	fmt.Printf("\n--- Fixed Code ---\n%s\n", result.FixedCode)

	fmt.Print("\nApply fix to file? (y/n): ")
	var confirm string
	fmt.Scanln(&confirm)
	if confirm == "y" {
		err := os.WriteFile(filePath, []byte(result.FixedCode), 0644)
		if err != nil {
			fmt.Printf("Error writing file: %v\n", err)
		} else {
			fmt.Println("File updated successfully!")
		}
	}
}

func callAPI(path string, payload interface{}) []byte {
	jsonPayload, _ := json.Marshal(payload)
	resp, err := http.Post(apiBaseURL+path, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		fmt.Printf("Error calling API: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	return body
}
