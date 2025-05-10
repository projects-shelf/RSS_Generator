package api

import (
	"back/api/auto"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func AutoHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		url := c.Query("url")
		if url == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing url"})
			return
		}

		// Gemini
		key := os.Getenv("Gemini")
		if key != "" {
			result, err := auto.Gemini(key, url)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err})
				return
			}
			c.JSON(http.StatusOK, result)
		}

		c.Status(http.StatusOK)
	}
}
