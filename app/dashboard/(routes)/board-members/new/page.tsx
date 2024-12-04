"use client";

import { BoardMemberForm } from "../_components/board-member-form";

const NewBoardMemberPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BoardMemberForm />
      </div>
    </div>
  );
};

export default NewBoardMemberPage;
