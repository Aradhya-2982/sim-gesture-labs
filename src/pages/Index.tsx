import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Cpu } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { loadProjects, saveProject, deleteProject, importProject } from "@/lib/storage";
import { Project } from "@/types/project";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gestures: [],
    };

    saveProject(project);
    setProjects(loadProjects());
    setIsCreateOpen(false);
    setNewProjectName("");
    setNewProjectDesc("");
    toast.success("Project created!");
    navigate(`/studio/${project.id}`);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setProjects(loadProjects());
    toast.success("Project deleted");
  };

  const handleImport = async () => {
    try {
      const project = await importProject();
      saveProject(project);
      setProjects(loadProjects());
      toast.success("Project imported!");
    } catch (error) {
      toast.error("Failed to import project");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
      
      <div className="relative">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Cpu className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Hardware Simulator</h1>
                  <p className="text-sm text-muted-foreground">
                    Record, test, and visualize hardware gestures
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Start a new hardware simulation project
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Project Name
                        </label>
                        <Input
                          placeholder="My Hardware Simulation"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateProject();
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Description (optional)
                        </label>
                        <Textarea
                          placeholder="Describe your project..."
                          value={newProjectDesc}
                          onChange={(e) => setNewProjectDesc(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProject}>Create Project</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-6">
                <Cpu className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first simulation project to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create First Project
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Your Projects</h2>
                <p className="text-muted-foreground">
                  {projects.length} {projects.length === 1 ? "project" : "projects"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() => navigate(`/studio/${project.id}`)}
                    onDelete={() => handleDeleteProject(project.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
