package database

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

type Data struct {
	ID     string `json:"id"`
	STATUS int    `json:"status"`
	URL    string `json:"url"`
}

func OpenDataDB() *sql.DB {
	db, err := sql.Open("sqlite", "/db/data.db")
	if err != nil {
		panic(err)
	}

	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS data (
            id TEXT PRIMARY KEY,
            status INTEGER,
            url TEXT
        );
    `)
	if err != nil {
		panic(err)
	}

	return db
}

func WriteData(db *sql.DB, data Data) error {
	_, err := db.Exec("INSERT INTO data (id, status, url) VALUES (?, ?, ?)",
		data.ID, data.STATUS, data.URL)
	return err
}

func DeleteData(db *sql.DB, id string) error {
	_, err := db.Exec("DELETE FROM data WHERE id = ?", id)
	return err
}

func UpdateDataStatus(db *sql.DB, id string, status int) error {
	_, err := db.Exec("UPDATE data SET status = ? WHERE id = ?", status, id)
	return err
}

func ReadAllData(db *sql.DB) ([]Data, error) {
	rows, err := db.Query("SELECT id, status, url FROM data")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dataList []Data
	for rows.Next() {
		var d Data
		if err := rows.Scan(&d.ID, &d.STATUS, &d.URL); err != nil {
			return nil, err
		}
		dataList = append(dataList, d)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return dataList, nil
}

func ReadData(db *sql.DB, id string) (Data, error) {
	var d Data
	err := db.QueryRow("SELECT id, status, url FROM data WHERE id = ?", id).
		Scan(&d.ID, &d.STATUS, &d.URL)
	return d, err
}
