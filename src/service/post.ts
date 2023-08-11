import { User, getUserIdbyOauthId } from "./user";
import PostSchema from "@/schema/post";
import CommentSchema from "@/schema/comment";

import { connect } from "@/lib/mongoose";
import { Group } from "./group";
import mongoose, { now } from "mongoose";
import { showPostCount } from "@/app/api/post/[groupId]/[page]/route";
import { dateFormat, day_now, timeFormat } from "@/util/dayjs";
import dayjs, { Dayjs } from "dayjs";

export interface Comment {
  _id: string;
  author: User;
  content: string;
  postId: Post;
  createAt: Date | string;
}
export interface Post {
  _id: string;
  author: User;
  title: string;
  content: string;
  createAt: string;
  images: string[];
  comments: Comment[];
  group: Group;
}

export async function AddPost(
  author: User,
  groupId: string,
  content: string,
  images?: string[]
) {
  await connect();

  const id = await getUserIdbyOauthId(author.id);

  const newPost = new PostSchema({
    author: id,
    group: groupId,
    images,
    content,
  });

  return newPost.save();
}

export async function getPosts(
  groupId: string,
  page?: number,
  id?: string,
  date?: string
) {
  await connect();

  // const searchDate = date ? dayjs(date) : undefined;
  const author_id = id ? await getUserIdbyOauthId(id) : undefined;

  let filter: { group: string; author?: any; createAt?: any } = {
    group: groupId,
  };
  if (author_id) filter.author = author_id;

  if (date) {
    // searchDate.setHours(searchDate.getHours() + 2);

    // const nextDay = new Date(searchDate);

    // console.log(day_now());
    // console.log(dayjs(date).format("YYYY-MM-DD"));
    // console.log(dayjs(date).add(1, "day").format("YYYY-MM-DD"));

    filter.createAt = {
      $gte: dayjs(date).format("YYYY-MM-DD"),
      $lt: dayjs(date).add(1, "day").format("YYYY-MM-DD"),
    };
  }
  // console.log(filter);

  if (page) {
    return PostSchema.find(filter, "", {
      sort: { createAt: -1 },
      limit: showPostCount,
      skip: (page - 1) * showPostCount,
    })
      .populate("author")
      .then((posts) => {
        return {
          next: posts.length < 5 ? null : page + 1,
          posts: [...posts],
        };
      });
  } else {
    return PostSchema.find({ group: groupId }, "", {
      sort: { createAt: -1 },
    }).populate("author");
  }
}

export async function uploadImage(image: Blob) {
  let form = new FormData();
  form.append("image", image);

  return fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
    },
    body: form,
  }).then((res) => res.json());
}
