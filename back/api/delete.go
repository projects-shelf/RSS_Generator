package api

import (
	"back/database"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeleteHandler(dataDB *sql.DB, xpathDB *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Query("id")
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
			return
		}

		// データベースから削除
		err := database.DeleteData(dataDB, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete from data"})
			return
		}

		err = database.DeleteXpath(xpathDB, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete from xpath"})
			return
		}

		c.Status(http.StatusOK)
	}
}
