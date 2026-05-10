import { Idea, Project, Activity } from '../types';

const KEYS = {
  ideas: 'codecraft_ideas',
  projects: 'codecraft_projects',
  activities: 'codecraft_activities',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Seed data
const seedIdeas: Idea[] = [
  {
    id: generateId(),
    author: 'Rizky Pratama',
    title: 'AI-Powered Code Review Bot',
    description: 'Membuat bot Discord yang otomatis review pull request menggunakan AI. Bot bisa detect bug, suggest improvement, dan check coding style.',
    status: 'new',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Hackathon Tracker Platform',
    author: 'Sari Dewi',
    description: 'Platform untuk tracking hackathon submission, deadline, dan progress tim. Include leaderboard dan badge system.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Interactive CSS Art Gallery',
    author: 'Budi Santoso',
    description: 'Website galeri yang menampilkan karya seni dibuat murni dengan CSS. Visitor bisa vote dan submit karya mereka sendiri.',
    status: 'implemented',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Pair Programming Roulette',
    author: 'Anisa Rahma',
    description: 'Fitur random match untuk cari partner coding. Kayak Tinder tapi buat developer — swipe right buat pair programming!',
    status: 'new',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: generateId(),
    title: 'CLI Task Manager',
    author: 'Farhan Akbar',
    description: 'Task manager yang jalan di terminal dengan TUI (Terminal User Interface). Support kanban board view dan time tracking.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

const seedProjects: Project[] = [
  {
    id: generateId(),
    name: 'CodeCraft Website v2',
    description: 'Redesign website utama CodeCraft dengan animasi 3D dan dark mode.',
    thumbnail: '/seed/project1.jpg',
    projectUrl: 'https://codecraft.dev',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: generateId(),
    name: 'DevQuiz App',
    description: 'Quiz interaktif tentang programming dengan leaderboard dan streak system.',
    thumbnail: '/seed/project2.jpg',
    projectUrl: 'https://devquiz.app',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const seedActivities: Activity[] = [
  {
    id: generateId(),
    imageUrl: '/seed/workshop.jpg',
    caption: 'Workshop Web Development 2024',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: generateId(),
    imageUrl: '/seed/hackathon.jpg',
    caption: 'Hackathon CodeFest Season 3',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

function getFromStorage<T>(key: string, seed: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Ideas
export function getIdeas(): Idea[] {
  return getFromStorage(KEYS.ideas, seedIdeas);
}

export function saveIdeas(ideas: Idea[]): void {
  saveToStorage(KEYS.ideas, ideas);
}

export function addIdea(idea: Omit<Idea, 'id' | 'createdAt'>): Idea {
  const ideas = getIdeas();
  const newIdea: Idea = {
    ...idea,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  ideas.unshift(newIdea);
  saveIdeas(ideas);
  return newIdea;
}

export function updateIdeaStatus(id: string, status: Idea['status']): void {
  const ideas = getIdeas();
  const idx = ideas.findIndex((i) => i.id === id);
  if (idx !== -1) {
    ideas[idx].status = status;
    saveIdeas(ideas);
  }
}

export function deleteIdea(id: string): void {
  const ideas = getIdeas().filter((i) => i.id !== id);
  saveIdeas(ideas);
}

// Projects
export function getProjects(): Project[] {
  return getFromStorage(KEYS.projects, seedProjects);
}

export function saveProjects(projects: Project[]): void {
  saveToStorage(KEYS.projects, projects);
}

export function addProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  projects.unshift(newProject);
  saveProjects(projects);
  return newProject;
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...updates };
    saveProjects(projects);
  }
}

// Activities
export function getActivities(): Activity[] {
  return getFromStorage(KEYS.activities, seedActivities);
}

export function saveActivities(activities: Activity[]): void {
  saveToStorage(KEYS.activities, activities);
}

export function addActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  activities.unshift(newActivity);
  saveActivities(activities);
  return newActivity;
}

export function deleteActivity(id: string): void {
  const activities = getActivities().filter((a) => a.id !== id);
  saveActivities(activities);
}

export function updateActivity(id: string, updates: Partial<Activity>): void {
  const activities = getActivities();
  const idx = activities.findIndex((a) => a.id === id);
  if (idx !== -1) {
    activities[idx] = { ...activities[idx], ...updates };
    saveActivities(activities);
  }
}
