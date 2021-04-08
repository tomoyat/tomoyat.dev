import React from "react"
import Header from "./header"
export default function Layout({ children }) {

  return (
    <div>
      <Header />
      <div style={{ margin: `2rem auto`, maxWidth: 960 }}>
      {children}
      </div>
    </div>
  )
}
