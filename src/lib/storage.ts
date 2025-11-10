import { Project } from "@/types/project";

const STORAGE_KEY = "hardware-sim-projects";

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const loadProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveProject = (project: Project) => {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  saveProjects(projects);
};

export const deleteProject = (id: string) => {
  const projects = loadProjects().filter((p) => p.id !== id);
  saveProjects(projects);
};

export const exportProject = (project: Project) => {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name}.simproj.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importProject = (): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.simproj.json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const project = JSON.parse(e.target?.result as string);
          resolve(project);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
};
