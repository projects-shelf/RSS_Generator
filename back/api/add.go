package api

import (
	"back/database"
	"database/sql"
	"net/http"
	nurl "net/url"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AddHandler(dataDB *sql.DB, xpathDB *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		url := c.Query("url")
		titleXPath := c.Query("titleX")
		descriptionXPath := c.Query("descriptionX")
		dateXPath := c.Query("dateX")
		thumbnailXPath := c.Query("thumbnailX")
		if url == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing url"})
			return
		}
		decodedUrl, err := nurl.QueryUnescape(url)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL"})
			return
		}

		id := uuid.New().String()

		// data
		data := database.Data{
			ID:     id,
			STATUS: 0,
			URL:    decodedUrl,
		}

		err = database.WriteData(dataDB, data)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert data"})
			return
		}

		// xpath

		xpath := database.Xpath{
			ID:          id,
			Title:       titleXPath,
			Description: descriptionXPath,
			Date:        dateXPath,
			Thumbnail:   thumbnailXPath,
		}

		err = database.UpdateXPath(xpathDB, xpath)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert xpath"})
			return
		}

		c.JSON(http.StatusOK, data)
	}
}
