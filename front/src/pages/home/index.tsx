import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
	const [url, setUrl] = useState("");
	const navigate = useNavigate();

	const handleAddClick = () => {
		if (url.trim()) {
			navigate(`/edit?url=${encodeURIComponent(url)}`);
		}
	};

	return (
		<div className="flex w-full flex-col items-center justify-center min-h-screen p-4">
			<h1 className="text-3xl font-bold mb-6 text-center">shelf | RSS_Generator</h1>
			<div className="flex w-full max-w-sm items-center space-x-2 mb-6 ">
				<Input
					type="text"
					placeholder="URL"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
				/>
				<Button type="button" onClick={handleAddClick}>
					Add
				</Button>
			</div>
		</div>
	)
}