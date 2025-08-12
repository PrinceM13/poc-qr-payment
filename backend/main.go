package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type PaymentStatus struct {
	Status string `json:"status"`
}

var payments = struct {
	sync.RWMutex
	data map[string]chan string
}{data: make(map[string]chan string)}

func main() {
	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	r.GET("/create-payment", handleCreatePayment)
	r.GET("/events/:paymentID", handleEvents)
	r.POST("/simulate-payment/:paymentID", handleSimulatePayment)

	fmt.Println("Gin backend running on :8080")
	r.Run(":8080")
}

func handleCreatePayment(c *gin.Context) {
	paymentID := fmt.Sprintf("%d", time.Now().UnixNano())

	payments.Lock()
	payments.data[paymentID] = make(chan string, 1)
	payments.Unlock()

	resp := map[string]string{
		"paymentID": paymentID,
		"qrURL":     fmt.Sprintf("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost/pay/%s", paymentID),
	}
	c.JSON(http.StatusOK, resp)
}

func handleEvents(c *gin.Context) {
	paymentID := c.Param("paymentID")

	payments.RLock()
	ch, ok := payments.data[paymentID]
	payments.RUnlock()

	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment ID not found"})
		return
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	// Listen for messages
	for msg := range ch {
		fmt.Fprintf(c.Writer, "data: %s\n\n", msg)
		if f, ok := c.Writer.(http.Flusher); ok {
			f.Flush()
		}
	}
}

func handleSimulatePayment(c *gin.Context) {
	paymentID := c.Param("paymentID")

	payments.RLock()
	ch, ok := payments.data[paymentID]
	payments.RUnlock()

	if ok {
		event := map[string]string{"status": "success"}
		data, _ := json.Marshal(event)
		ch <- string(data)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment simulated"})
}
