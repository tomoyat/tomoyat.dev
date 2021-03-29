import { useStaticQuery, Link, graphql } from "gatsby"
import React from "react"
import * as headerStyles from "./header.module.css"

export default function Header() {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )
  return (
    <header className={headerStyles.header}>
      <div className={headerStyles.logo}>
        <Link to={`/`} className={headerStyles.logoLink}>
          {data.site.siteMetadata.title}
        </Link>
      </div>
      <nav className={headerStyles.nav}>
        <Link to={`/blog`} className={headerStyles.navLink}>
          blog
        </Link>
      </nav>
    </header>
  )
}
