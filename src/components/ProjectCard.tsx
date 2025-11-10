import { Project } from "@/types/project";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2, Download } from "lucide-react";
import { exportProject } from "@/lib/storage";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
}

export const ProjectCard = ({ project, onOpen, onDelete }: ProjectCardProps) => {
  return (
    <Card className="p-6 hover:border-primary/50 transition-all cursor-pointer group">
      <div onClick={onOpen}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-muted-foreground text-sm">{project.description}</p>
            )}
          </div>
          <FolderOpen className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <span className="font-mono">{project.gestures.length}</span> gestures
          </div>
          <div className="text-xs">
            {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            exportProject(project);
          }}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </Card>
  );
};
