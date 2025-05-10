package api

import (
	"back/database"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func LoadDataListHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		dataList, err := database.ReadAllData(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve data"})
			return
		}
		c.JSON(http.StatusOK, dataList)
	}
}

func LoadXPathHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Query("id")
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
			return
		}

		xpath, err := database.ReadXpath(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve data"})
			return
		}
		c.JSON(http.StatusOK, xpath)
	}
}
