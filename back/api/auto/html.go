package auto

import (
	"strings"

	"golang.org/x/net/html"
)

func removeScript(n *html.Node) {
	for c := n.FirstChild; c != nil; {
		next := c.NextSibling
		if c.Type == html.ElementNode && c.Data == "script" {
			n.RemoveChild(c)
		} else {
			removeScript(c)
		}
		c = next
	}
}

func removeComments(n *html.Node) {
	for c := n.FirstChild; c != nil; {
		next := c.NextSibling
		if c.Type == html.CommentNode {
			n.RemoveChild(c)
		} else {
			removeComments(c)
		}
		c = next
	}
}

func removeHead(n *html.Node) {
	for c := n.FirstChild; c != nil; {
		next := c.NextSibling
		if c.Type == html.ElementNode && c.Data == "head" {
			n.RemoveChild(c)
		} else {
			removeHead(c)
		}
		c = next
	}
}

func removeOtherAttributes(n *html.Node) {
	if n.Type == html.ElementNode {
		for i := len(n.Attr) - 1; i >= 0; i-- {
			attr := n.Attr[i]
			if !(attr.Key == "class" || attr.Key == "id" || attr.Key == "src" || attr.Key == "href") {
				n.Attr = append(n.Attr[:i], n.Attr[i+1:]...)
			}
		}
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		removeOtherAttributes(c)
	}
}

func renderNode(n *html.Node) string {
	var b strings.Builder
	if err := html.Render(&b, n); err != nil {
		return ""
	}
	return b.String()
}

func shapeupDoc(doc *html.Node) string {
	removeScript(doc)
	removeComments(doc)
	removeHead(doc)
	removeOtherAttributes(doc)

	return renderNode(doc)
}
