package database

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
)

type History struct {
	GUID      string `json:"guid"`      // GUID
	Timestamp string `json:"timestamp"` // RFC1123Z形式
}

func OpenHistoryDB(id string) *sql.DB {
	db, err := sql.Open("sqlite", "/db/history/"+id+".db")
	if err != nil {
		panic(err)
	}

	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS history (
            guid TEXT PRIMARY KEY,
            timestamp TEXT
        );
    `)
	if err != nil {
		panic(err)
	}

	return db
}

func AddHistory(db *sql.DB, guid string) (string, error) {
	timestamp := time.Now().Format(time.RFC1123Z)
	_, err := db.Exec("INSERT INTO history (guid, timestamp) VALUES (?, ?)", guid, timestamp)
	return timestamp, err
}

func ReadHistory(db *sql.DB, guid string) (string, error) {
	var h History
	err := db.QueryRow("SELECT guid, timestamp FROM history WHERE guid = ?", guid).
		Scan(&h.GUID, &h.Timestamp)
	if err != nil {
		return AddHistory(db, guid)
	}
	return h.Timestamp, nil
}
