package database

import (
	"database/sql"
)

type Xpath struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`
	Thumbnail   string `json:"thumbnail"`
}

func OpenXPathDB() *sql.DB {
	db, err := sql.Open("sqlite", "/db/xpath.db")
	if err != nil {
		panic(err)
	}

	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS xpath (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            date TEXT,
            thumbnail TEXT
        );
    `)
	if err != nil {
		panic(err)
	}

	return db
}

func UpdateXPath(db *sql.DB, x Xpath) error {
	_, err := db.Exec(`
        INSERT INTO xpath (id, title, description, date, thumbnail)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            date = excluded.date,
            thumbnail = excluded.thumbnail;
    `, x.ID, x.Title, x.Description, x.Date, x.Thumbnail)
	return err
}

func ReadXpath(db *sql.DB, id string) (Xpath, error) {
	var x Xpath
	row := db.QueryRow(`
        SELECT id, title, description, date, thumbnail
        FROM xpath WHERE id = ?
    `, id)
	err := row.Scan(&x.ID, &x.Title, &x.Description, &x.Date, &x.Thumbnail)
	return x, err
}

func DeleteXpath(db *sql.DB, id string) error {
	_, err := db.Exec(`DELETE FROM xpath WHERE id = ?`, id)
	return err
}
