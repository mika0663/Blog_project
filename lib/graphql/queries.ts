import { gql } from "@apollo/client";

// Query for paginated posts without category filter
export const GET_PAGINATED_POSTS = gql`
  query GetPaginatedPosts($limit: Int!, $offset: Int!) {
    postsCollection(
      first: $limit
      offset: $offset
      orderBy: { published_at: DescNullsLast }
      filter: {
        is_published: { eq: true }
      }
    ) {
      edges {
        node {
          id
          title
          slug
          excerpt
          cover_image
          published_at
          category_id
          author_id
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

// Query for paginated posts with category filter
export const GET_PAGINATED_POSTS_BY_CATEGORY = gql`
  query GetPaginatedPostsByCategory($limit: Int!, $offset: Int!, $categoryId: UUID!) {
    postsCollection(
      first: $limit
      offset: $offset
      orderBy: { published_at: DescNullsLast }
      filter: {
        is_published: { eq: true }
        category_id: { eq: $categoryId }
      }
    ) {
      edges {
        node {
          id
          title
          slug
          excerpt
          cover_image
          published_at
          category_id
          author_id
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

// Query for categories
export const GET_CATEGORIES = gql`
  query GetCategories {
    categoriesCollection(orderBy: { name: AscNullsLast }) {
      edges {
        node {
          id
          name
          slug
          description
        }
      }
    }
  }
`;

// Query to get category ID from slug
export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoriesCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }
`;

// Query to fetch post by ID
export const GET_POST_BY_ID = gql`
  query GetPostById($id: UUID!) {
    postsCollection(filter: { id: { eq: $id } }, first: 1) {
      edges {
        node {
          id
          title
          slug
          content
          excerpt
          cover_image
          published_at
          category_id
          author_id
          is_published
          created_at
          updated_at
        }
      }
    }
  }
`;

// Query to fetch post by slug (for URL routing)
export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    postsCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          id
          title
          slug
          content
          excerpt
          cover_image
          published_at
          category_id
          author_id
          is_published
          created_at
          updated_at
        }
      }
    }
  }
`;

// Mutation to create a new post
export const CREATE_POST = gql`
  mutation CreatePost(
    $title: String!
    $slug: String!
    $content: String!
    $excerpt: String
    $cover_image: String
    $category_id: UUID
    $author_id: UUID!
    $is_published: Boolean!
    $published_at: Datetime
  ) {
    insertIntopostsCollection(
      objects: [
        {
          title: $title
          slug: $slug
          content: $content
          excerpt: $excerpt
          cover_image: $cover_image
          category_id: $category_id
          author_id: $author_id
          is_published: $is_published
          published_at: $published_at
        }
      ]
    ) {
      records {
        id
        title
        slug
        content
        excerpt
        cover_image
        published_at
        category_id
        author_id
        is_published
        created_at
      }
    }
  }
`;

