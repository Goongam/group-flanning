"use client";

import { Group, getGroups } from "@/service/group";
import { useQuery } from "react-query";
import GroupListCard from "./GroupListCard";
import Loading from "./ui/Loading";
import { Category } from "@/app/page";

interface Props {
  selectCategory: Category;
}
export default function GroupList({ selectCategory }: Props) {
  const {
    data: groupList,
    isLoading,
    error,
  } = useQuery<Group[]>(["groups"], () =>
    fetch("/api/group").then((res) => res.json())
  );

  if (isLoading) {
    return (
      <Loading type="GridLoader" size={20} customStyle="mt-4" color="#04656c" />
    );
  }
  if (error) {
    return <div>error</div>;
  }
  return (
    <section className="flex-1 h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 m-3">
      {groupList?.map((group, index) => {
        if (group.category === selectCategory || selectCategory === "전체")
          return <GroupListCard key={`${group.id}${index}`} group={group} />;
      })}
    </section>
  );
}
