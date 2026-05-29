"use client";

import { CustomFolder } from "@/types/bookmark";
import FolderCard from "./FolderCard";

interface FolderListProps {
  folders: CustomFolder[];
  onDeleteFolder: (folderId: string) => void;
}

export default function FolderList({
  folders,
  onDeleteFolder,
}: FolderListProps): React.ReactElement {
  if (folders.length === 0) {
    return <></>;
  }

  return (
    <section className="grid grid-cols-3 gap-7 pb-16">
      {folders.map((folder, index) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          index={index}
          onDelete={onDeleteFolder}
        />
      ))}
    </section>
  );
}
