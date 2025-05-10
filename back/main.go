package main

import (
	"back/api"
	"back/database"
	"back/proxy"
	"os"
	"runtime"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := os.MkdirAll("/db/history", 0755); err != nil {
		panic(err)
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	dataDB := database.OpenDataDB()
	defer dataDB.Close()
	xpathDB := database.OpenXPathDB()
	defer xpathDB.Close()

	// proxy
	r.GET("/proxy_init/:scheme/:domain/*path", withGC(proxy.ProxyInitHandler))
	r.GET("/proxy/*path", withGC(proxy.ProxyHandler))

	// api
	r.GET("/api/add", withGC(api.AddHandler(dataDB, xpathDB)))
	r.GET("/api/edit", withGC(api.EditHandler(dataDB, xpathDB)))
	r.GET("/api/delete", withGC(api.DeleteHandler(dataDB, xpathDB)))

	r.GET("/api/load/data", withGC(api.LoadDataListHandler(dataDB)))
	r.GET("/api/load/xpath", withGC(api.LoadXPathHandler(xpathDB)))

	r.GET("/api/auto", withGC(api.AutoHandler()))
	r.GET("/api/rss", withGC(api.RSSHandler(dataDB, xpathDB)))

	r.Run(":8080")
}

func withGC(handler gin.HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		handler(c)
		runtime.GC()
	}
}
