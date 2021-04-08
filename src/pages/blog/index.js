import React from "react"
import Layout from "../../components/layout"
import { Link, graphql } from "gatsby"

export default function Home({data}) {
  return (
    <Layout>
      {data.allMarkdownRemark.edges.map( ({node}) => (
        <div key={node.id}>
          <Link to={node.fields.slug}>
            <h3>{node.frontmatter.title}</h3>
            <p>{node.frontmatter.date}</p>
            <p>{node.excerpt}</p>
          </Link>
        </div>
      ))}

    </Layout>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY/MM/DD")
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`
