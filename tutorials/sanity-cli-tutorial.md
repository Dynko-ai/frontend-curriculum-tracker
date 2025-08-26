# Sanity.io CLI Hands-On Tutorial

## What is Sanity.io?

Sanity.io is a fully customizable headless CMS (Content Management System) that provides:
- **Structured Content**: Define content schemas with validation
- **Real-time Collaboration**: Multiple editors can work simultaneously
- **API-First**: RESTful and GraphQL APIs out of the box
- **Sanity Studio**: Beautiful, customizable content editing interface
- **Developer-Friendly**: Git-based workflows and version control

## Prerequisites

Before starting, ensure you have:
- Node.js v18+ installed
- npm, yarn, or pnpm package manager
- Code editor (VS Code recommended)
- Basic knowledge of JavaScript and React

## Step 1: Install Sanity CLI

### Option 1: Global Installation (Recommended)
```bash
npm install -g @sanity/cli
```

### Option 2: Use without installing globally
```bash
npx @sanity/cli@latest
```

### Verify Installation
```bash
sanity --version
```

## Step 2: Create Your First Sanity Project

### Initialize New Project
```bash
sanity init
```

The CLI will prompt you through several steps:

1. **Login/Signup**: Use Google, GitHub, or email
2. **Project Name**: Choose a descriptive name (e.g., "my-blog-cms")
3. **Dataset**: Use "production" for real projects, "development" for learning
4. **Template**: Start with "Blog" or "Clean project with no predefined schema"
5. **Package Manager**: Choose npm, yarn, or pnpm

### Example Flow
```bash
? Create project in what name? my-blog-cms
? Choose a project template: Blog (schema + sample data)
? Choose package manager: npm
```

## Step 3: Project Structure Overview

After initialization, you'll have:

```
my-blog-cms/
├── schemas/           # Content type definitions
│   ├── author.js     # Author content type
│   ├── blockContent.js # Rich text configuration
│   ├── category.js   # Category content type
│   └── post.js       # Blog post content type
├── static/           # Static assets (images, icons)
├── sanity.config.js  # Main configuration file
├── sanity.cli.js     # CLI configuration
└── package.json      # Dependencies and scripts
```

## Step 4: Start Development Server

```bash
cd my-blog-cms
npm run dev
```

This opens Sanity Studio at `http://localhost:3333`

## Step 5: Understanding Schemas

Schemas define your content structure. Here's a simple blog post schema:

```javascript
// schemas/post.js
export default {
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      }
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime'
    },
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent'
    }
  ]
}
```

## Step 6: Essential CLI Commands

### Project Management
```bash
sanity start                 # Start development server
sanity build                # Build production bundle
sanity deploy               # Deploy Studio to Sanity's hosting
```

### Data Management
```bash
sanity dataset list         # List all datasets
sanity dataset create test  # Create new dataset
sanity dataset export       # Export data
sanity dataset import       # Import data
```

### Schema Management
```bash
sanity schema extract       # Extract schema as JSON
sanity graphql deploy       # Deploy GraphQL API
```

### Authentication
```bash
sanity login                # Login to Sanity
sanity logout               # Logout
sanity projects list        # List your projects
```

## Step 7: Create Your First Content Type

Let's create a "Product" schema for an e-commerce site:

1. Create `schemas/product.js`:
```javascript
export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: Rule => Rule.required().min(3).max(100)
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name'
      }
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{type: 'image'}]
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}]
    }
  ]
}
```

2. Update `sanity.config.js` to include the new schema:
```javascript
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import product from './schemas/product'

export default defineConfig({
  // ... existing config
  schema: {
    types: [...schemaTypes, product],
  },
})
```

## Step 8: Deploy Your Studio

### Deploy to Sanity's hosting
```bash
sanity deploy
```

Choose a unique studio hostname (e.g., `my-blog-studio`). Your studio will be available at `https://my-blog-studio.sanity.studio`

### Environment Variables for Production
Create `.env.local`:
```
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2023-05-03
```

## Step 9: Connect to Frontend (React)

### Install Sanity client
```bash
npm install @sanity/client
```

### Create client configuration
```javascript
// lib/sanity.js
import {createClient} from '@sanity/client'

export default createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: true, // Enable for faster, cached responses
  apiVersion: '2023-05-03'
})
```

### Fetch data in React
```javascript
// components/BlogPosts.jsx
import { useEffect, useState } from 'react'
import client from '../lib/sanity'

export default function BlogPosts() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await client.fetch(`
        *[_type == "post"] {
          title,
          slug,
          publishedAt,
          "author": author->name
        }
      `)
      setPosts(data)
    }
    
    fetchPosts()
  }, [])

  return (
    <div>
      {posts.map(post => (
        <article key={post.slug.current}>
          <h2>{post.title}</h2>
          <p>By {post.author}</p>
        </article>
      ))}
    </div>
  )
}
```

## Step 10: GROQ Query Language Basics

GROQ (Graph-Relational Object Queries) is Sanity's query language:

```javascript
// Get all posts
*[_type == "post"]

// Get posts with author details
*[_type == "post"] {
  title,
  "author": author->name,
  "categories": categories[]->title
}

// Get specific post by slug
*[_type == "post" && slug.current == $slug][0]

// Get recent posts
*[_type == "post"] | order(publishedAt desc) [0...3]
```

## Common Troubleshooting

### 1. Port Already in Use
```bash
sanity start --port 3334
```

### 2. Schema Changes Not Reflecting
- Restart the development server
- Clear browser cache

### 3. Deploy Issues
```bash
sanity login
sanity projects list
```

## Next Steps

1. **Learn GROQ**: Master query language for complex data fetching
2. **Custom Components**: Create custom field components for Studio
3. **Webhooks**: Set up real-time updates in your frontend
4. **Preview Mode**: Implement draft content previews
5. **Plugins**: Explore Sanity plugin ecosystem

## Best Practices

1. **Schema Design**: Plan your content structure before coding
2. **Validation**: Always add proper field validation
3. **References**: Use references instead of duplicating data
4. **Images**: Optimize images with Sanity's image API
5. **Version Control**: Keep schemas in version control
6. **Environment Management**: Use separate datasets for dev/prod

## Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Cheat Sheet](https://www.sanity.io/docs/groq-cheat-sheet)
- [Sanity Community](https://www.sanity.io/community)
- [Sanity Schema Types](https://www.sanity.io/docs/schema-types)

---

**🎯 Practice Challenge**: Create a portfolio CMS with schemas for projects, skills, and testimonials. Build a React frontend to display this data using GROQ queries.