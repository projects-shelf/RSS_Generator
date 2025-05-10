package auto

import (
	"context"
	"encoding/json"
	"net/http"

	"golang.org/x/net/html"
	"google.golang.org/genai"
)

func Gemini(key string, url string) (Result, error) {
	ctx := context.Background()

	client, _ := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  key,
		Backend: genai.BackendGeminiAPI,
	})

	config := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"title": {
					Type: genai.TypeString,
				},
				"description": {
					Type: genai.TypeString,
				},
				"date": {
					Type: genai.TypeString,
				},
				"thumbnail": {
					Type: genai.TypeString,
				},
			},
			Required: []string{"title", "description", "date", "thumbnail"},
		},
	}

	resp, err := http.Get(url)
	if err != nil {
		return Result{}, err
	}
	defer resp.Body.Close()

	doc, err := html.Parse(resp.Body)
	if err != nil {
		return Result{}, err
	}

	html := shapeupDoc(doc)

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.0-flash",
		genai.Text(
			"Generate the shortest XPath expressions for the elements that represent the articles' Title, Description, Date, and Thumbnail\n"+
				"Do not include attribute access like `/@src`,`/text()` in the XPath\n"+
				"---\n"+
				"HTML is\n"+
				html+
				"---\n"+
				"Using this JSON schema",
		),
		config,
	)
	if err != nil {
		return Result{}, err
	}

	text := result.Text()
	var r Result
	err = json.Unmarshal([]byte(text), &r)
	if err != nil {
		return Result{}, err
	}

	return r, nil
}
