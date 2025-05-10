package proxy

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

var lastdomain = ""

func ProxyInitHandler(c *gin.Context) {
	scheme := c.Param("scheme")
	domain := c.Param("domain")
	path := c.Param("path")

	targetURL := scheme + "://" + domain + path
	lastdomain = scheme + "://" + domain
	proxyURL := "http://nginx:80/proxy/?url=" + targetURL
	fmt.Println("ProxyInit: " + proxyURL)

	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}
	resp, err := client.Get(proxyURL)
	if err != nil {
		log.Println("Error fetching target URL:", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch target URL"})
		return
	}
	defer resp.Body.Close()

	for key, value := range resp.Header {
		for _, v := range value {
			c.Header(key, v)
		}
	}

	c.Status(resp.StatusCode)

	buf := make([]byte, 32*1024) // 32KB
	_, err = io.CopyBuffer(c.Writer, resp.Body, buf)
	if err != nil {
		log.Println("Error copying response body:", err)
	}
}

func ProxyHandler(c *gin.Context) {
	path := c.Param("path")

	if path == "/edit" || path == "/manage" {
		client := &http.Client{
			Timeout: 10 * time.Second,
			Transport: &http.Transport{
				DisableKeepAlives: true,
			},
		}
		resp, err := client.Get("http://nginx:80/return_index/")
		if err != nil {
			log.Println("Error fetching target URL:", err)
			c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch target URL"})
			return
		}
		defer resp.Body.Close()

		for key, value := range resp.Header {
			for _, v := range value {
				c.Header(key, v)
			}
		}

		c.Status(resp.StatusCode)

		buf := make([]byte, 32*1024) // 32KB
		_, err = io.CopyBuffer(c.Writer, resp.Body, buf)
		if err != nil {
			log.Println("Error copying response body:", err)
		}

		return
	}

	targetURL := lastdomain + path
	proxyURL := "http://nginx:80/proxy/?url=" + targetURL

	fmt.Println("Proxy: " + proxyURL)

	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}
	resp, err := client.Get(proxyURL)
	if err != nil {
		log.Println("Error fetching target URL:", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch target URL"})
		return
	}
	defer resp.Body.Close()

	for key, value := range resp.Header {
		for _, v := range value {
			c.Header(key, v)
		}
	}

	c.Status(resp.StatusCode)

	buf := make([]byte, 32*1024) // 32KB
	_, err = io.CopyBuffer(c.Writer, resp.Body, buf)
	if err != nil {
		log.Println("Error copying response body:", err)
	}
}
