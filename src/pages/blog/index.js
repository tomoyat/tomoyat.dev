import React from "react"
import Layout from "../../components/layout"
import Card from "../../components/blog/card"
import { graphql } from "gatsby"

export default function Blog({ data }) {
  return (
    <Layout>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <div key={node.id}>
          <Card slug={node.fields.slug}
                title={node.frontmatter.title}
                date={node.frontmatter.date}
                excerpt={node.excerpt} />
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
