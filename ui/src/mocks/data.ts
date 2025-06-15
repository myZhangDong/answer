/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Mock data for frontend development
export const mockQuestions = [
  {
    id: '1',
    title: 'How to implement video streaming in web applications?',
    content: 'I want to build a video streaming platform similar to YouTube...',
    author: {
      username: 'developer01',
      avatar: 'https://via.placeholder.com/40x40',
    },
    tags: ['video', 'streaming', 'web'],
    votes: 15,
    answers: 3,
    views: 234,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Best practices for React component optimization',
    content: 'What are the best practices for optimizing React components...',
    author: {
      username: 'reactdev',
      avatar: 'https://via.placeholder.com/40x40',
    },
    tags: ['react', 'optimization', 'performance'],
    votes: 8,
    answers: 1,
    views: 156,
    created_at: '2024-01-14T15:20:00Z',
  },
];

export const mockVideos = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description:
      'Learn the basics of web development with HTML, CSS, and JavaScript',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '15:30',
    author: {
      username: 'webteacher',
      avatar: 'https://via.placeholder.com/40x40',
    },
    views: 1250,
    likes: 45,
    created_at: '2024-01-10T12:00:00Z',
  },
  {
    id: '2',
    title: 'Advanced React Hooks Tutorial',
    description: 'Deep dive into React Hooks and custom hook patterns',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '28:45',
    author: {
      username: 'reactpro',
      avatar: 'https://via.placeholder.com/40x40',
    },
    views: 890,
    likes: 32,
    created_at: '2024-01-08T09:15:00Z',
  },
  {
    id: '3',
    title: 'Building REST APIs with Node.js',
    description:
      'Complete guide to building scalable REST APIs using Node.js and Express',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '45:20',
    author: {
      username: 'nodemaster',
      avatar: 'https://via.placeholder.com/40x40',
    },
    views: 2100,
    likes: 78,
    created_at: '2024-01-05T14:30:00Z',
  },
];

export const mockTags = [
  { name: 'javascript', count: 1234 },
  { name: 'react', count: 890 },
  { name: 'nodejs', count: 567 },
  { name: 'video', count: 234 },
  { name: 'streaming', count: 123 },
];

export const mockUsers = [
  {
    id: '1',
    username: 'developer01',
    avatar: 'https://via.placeholder.com/100x100',
    reputation: 1250,
    badges: ['gold', 'silver', 'bronze'],
  },
  {
    id: '2',
    username: 'reactdev',
    avatar: 'https://via.placeholder.com/100x100',
    reputation: 890,
    badges: ['silver', 'bronze'],
  },
];

export const mockSiteInfo = {
  name: 'Answer Development',
  description: 'A Q&A platform for developers',
  version: '1.0.0-dev',
  logo: 'https://via.placeholder.com/120x40',
};
