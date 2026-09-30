import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

function App() {
  return (
    <main>
      <h1>Write It Out</h1>
      <p>Write freely. Let it disappear.</p>
    </main>
  )
}

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
