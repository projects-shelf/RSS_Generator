package api

import (
	"back/database"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func EditHandler(dataDB *sql.DB, xpathDB *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Query("id")
		titleXPath := c.Query("titleX")
		descriptionXPath := c.Query("descriptionX")
		dateXPath := c.Query("dateX")
		thumbnailXPath := c.Query("thumbnailX")
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
			return
		}

		// data

		database.UpdateDataStatus(dataDB, id, 0)

		// xpath

		xpath := database.Xpath{
			ID:          id,
			Title:       titleXPath,
			Description: descriptionXPath,
			Date:        dateXPath,
			Thumbnail:   thumbnailXPath,
		}

		err := database.UpdateXPath(xpathDB, xpath)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert xpath"})
			return
		}

		c.JSON(http.StatusOK, "")
	}
}
