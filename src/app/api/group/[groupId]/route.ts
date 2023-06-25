import { getGroup } from "@/service/group";
import { withSession } from "@/util/session";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: { groupId: string };
}

export async function GET(req: NextRequest, context: Context) {
  const { groupId } = context.params;

  return withSession((user) => {
    return getGroup(groupId)
      .then((groupData) => {
        const isJoin = groupData?.users.find((u) => user.email === u.email);
        if (isJoin) return NextResponse.json(groupData);
        else return new Response("you don't join this group", { status: 401 });
      })
      .catch((err) => new Response(err, { status: 400 }));
  });
}
