import React from "react";
import ReactDOM from "react-dom/client";
import type { ZoomAnimal } from "@animal-zoom/share";

const animals: ZoomAnimal[] = [
  { id: "lion", name: "Lion", imageUrl: "" },
  { id: "tiger", name: "Tiger", imageUrl: "" }
];

function App() {
  return (
    <main>
      <h1>Animal Zoom WebApp</h1>
      <ul>
        {animals.map((animal) => (
          <li key={animal.id}>{animal.name}</li>
        ))}
      </ul>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
