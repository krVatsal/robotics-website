import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDB()

    const pipeline = [
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "leaderId",
          foreignField: "_id",
          as: "leaderDetails",
        },
      },
      {
        $unwind: {
          path: "$leaderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "memberDetails",
        },
      },
      {
        $lookup: {
          from: "competitions",
          localField: "competitionId",
          foreignField: "_id",
          as: "competitionDetails",
        },
      },
      {
        $unwind: {
          path: "$competitionDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          teamCode: 1,
          isFinalized: 1,
          createdAt: 1,
          maxMembers: { $ifNull: ["$competitionDetails.maxTeamSize", 4] },
          leader: {
            _id: "$leaderDetails._id",
            name: { $ifNull: ["$leaderDetails.name", "Unknown"] },
          },
          members: {
            $map: {
              input: "$memberDetails",
              as: "m",
              in: { _id: "$$m._id", name: "$$m.name", email: "$$m.email" },
            },
          },
          competitionName: {
            $ifNull: [
              "$competitionDetails.title",
              "$competitionDetails.name",
              "General",
            ],
          },
        },
      },
    ]

    const teams = await db.collection("teams").aggregate(pipeline).toArray()
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
