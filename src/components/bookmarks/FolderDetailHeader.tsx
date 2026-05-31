import Link from "next/link";
import { CustomFolder } from "@/types/bookmark";
import { getFolderEmoji } from "@/lib/folderUtils";

const FOLDER_COLORS = [
  {
    background: "linear-gradient(135deg, #3B82F6 0%, #93C5FD 100%)",
  },
  {
    background: "linear-gradient(135deg, #38BDF8 0%, #B6EEFF 100%)",
  },
  {
    background: "linear-gradient(135deg, #34D399 0%, #A7F3D0 100%)",
  },
  {
    background: "linear-gradient(135deg, #A78BFA 0%, #DDD6FE 100%)",
  },
  {
    background: "linear-gradient(135deg, #60A5FA 0%, #BFDBFE 100%)",
  },
  {
    background: "linear-gradient(135deg, #22D3EE 0%, #CFFAFE 100%)",
  },
];

interface FolderDetailHeaderProps {
  folder: CustomFolder;
}

export default function FolderDetailHeader({
  folder,
}: FolderDetailHeaderProps): React.ReactElement {
  const emoji = getFolderEmoji(folder.icon);
  const colorStyle = FOLDER_COLORS[folder.colorIndex % FOLDER_COLORS.length];

  return (
    <div className="mb-8">
      <Link
        href="/custom-folder"
        className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
      >
        ← 커스텀폴더로 돌아가기
      </Link>

      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-50 shadow-inner">
          <div
            className="flex h-14 w-16 items-center justify-center rounded-2xl shadow-md text-4xl"
            style={colorStyle}
          >
            {emoji}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            {folder.title}
          </h1>
          <p className="mt-2 text-base font-semibold text-slate-500">
            이 폴더에 저장한 장소들
          </p>
        </div>
      </div>
    </div>
  );
}
