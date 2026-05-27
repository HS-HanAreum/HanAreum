"use client";

import Link from "next/link";
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
        <Link
          key={folder.id}
          href={`/custom-folder/${folder.id}`}
          className="transition hover:opacity-80"
        >
          <FolderCard
            folder={folder}
            index={index}
            onDelete={onDeleteFolder}
          />
        </Link>
      ))}
    </section>
  );
}
