import React from "react"
import Header from "./header"
import { Helmet } from "react-helmet"
import { graphql, useStaticQuery } from "gatsby"
export default function Layout({ children }) {
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
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{data.site.siteMetadata.title}</title>
      </Helmet>
      <Header />
      <div style={{ margin: `2rem auto`, maxWidth: 960 }}>
      {children}
      </div>
    </div>
  )
}
