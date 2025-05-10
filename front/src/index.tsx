import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import Layout from "./layout";

import HomePage from "./pages/home";
import ManagePage from "./pages/manage";

import EditPage from "./pages/edit";

const container = document.querySelector("#root");
if (!container) {
	throw new Error("No root element found");
}
const root = createRoot(container);

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<HomePage />} />
					<Route path="manage" element={<ManagePage />} />
					<Route path="edit" element={<EditPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
);
