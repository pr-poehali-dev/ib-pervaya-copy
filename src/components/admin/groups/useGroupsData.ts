import { useState } from "react";
import { User, CourseAssignment, CourseStatus } from "@/components/admin/types";
import { today } from "./groupsUtils";

export function useGroupsData(initialUsers: User[], adminName = "Администратор") {
  const [localUsers, setLocalUsers] = useState<User[]>(initialUsers);

  const addCoursesToMember = (userId: number, courseIds: number[], groupId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const enrollment = u.enrollments.find((e) => e.groupId === groupId);
      if (!enrollment) return u;
      const newAssignments: CourseAssignment[] = courseIds
        .filter((id) => !enrollment.assignments.some((a) => a.courseId === id))
        .map((id) => ({ courseId: id, active: true, progress: 0, assignedAt: today(), status: "pending" as CourseStatus, history: [] }));
      return {
        ...u,
        enrollments: u.enrollments.map((e) =>
          e.groupId !== groupId ? e : { ...e, assignments: [...e.assignments, ...newAssignments] }
        ),
      };
    }));
  };

  const addCoursesToGroup = (groupId: number, courseIds: number[]) => {
    setLocalUsers((prev) => prev.map((u) => {
      const enrollment = u.enrollments.find((e) => e.groupId === groupId);
      if (!enrollment) return u;
      const newAssignments: CourseAssignment[] = courseIds
        .filter((id) => !enrollment.assignments.some((a) => a.courseId === id))
        .map((id) => ({ courseId: id, active: true, progress: 0, assignedAt: today(), status: "pending" as CourseStatus, history: [] }));
      return {
        ...u,
        enrollments: u.enrollments.map((e) =>
          e.groupId !== groupId ? e : { ...e, assignments: [...e.assignments, ...newAssignments] }
        ),
      };
    }));
  };

  const activateCourse = (userId: number, courseId: number, date?: string, groupId?: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        enrollments: u.enrollments.map((e) => {
          if (groupId !== undefined && e.groupId !== groupId) return e;
          return {
            ...e,
            assignments: e.assignments.map((a) =>
              a.courseId !== courseId ? a : {
                ...a,
                activatedAt: date ?? today(),
                active: true,
                status: "active" as CourseStatus,
                progress: 0,
                history: [...(a.history ?? []), { date: today(), action: "Курс активирован", by: adminName }],
              }
            ),
          };
        }),
      };
    }));
  };

  const extendCourse = (userId: number, courseId: number, groupId?: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        enrollments: u.enrollments.map((e) => {
          if (groupId !== undefined && e.groupId !== groupId) return e;
          return {
            ...e,
            assignments: e.assignments.map((a) =>
              a.courseId !== courseId ? a : {
                ...a,
                status: "active" as CourseStatus,
                history: [...(a.history ?? []), { date: today(), action: "Курс продлён", by: adminName }],
              }
            ),
          };
        }),
      };
    }));
  };

  const issueCertificate = (userId: number, courseId: number, groupId?: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        enrollments: u.enrollments.map((e) => {
          if (groupId !== undefined && e.groupId !== groupId) return e;
          return {
            ...e,
            assignments: e.assignments.map((a) =>
              a.courseId !== courseId ? a : {
                ...a,
                status: "certified" as CourseStatus,
                progress: 100,
                completedAt: a.completedAt ?? today(),
                history: [...(a.history ?? []), { date: today(), action: "Выдано удостоверение", by: adminName }],
              }
            ),
          };
        }),
      };
    }));
  };

  const toggleAssignment = (userId: number, courseId: number, groupId?: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        enrollments: u.enrollments.map((e) => {
          if (groupId !== undefined && e.groupId !== groupId) return e;
          return {
            ...e,
            assignments: e.assignments.map((a) => {
              if (a.courseId !== courseId) return a;
              return {
                ...a,
                active: !a.active,
                history: [...(a.history ?? []), { date: today(), action: a.active ? "Курс отключён" : "Курс включён", by: adminName }],
              };
            }),
          };
        }),
      };
    }));
  };

  const addMemberToGroup = (userId: number, groupId: number, groupName: string) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      if (u.enrollments.some((e) => e.groupId === groupId)) return u;
      return { ...u, enrollments: [...u.enrollments, { groupId, groupName, assignments: [] }] };
    }));
  };

  const handleActivateAll = (groupId: number, members: User[]) => {
    const date = today();
    members.forEach((u) => {
      const enrollment = u.enrollments.find((e) => e.groupId === groupId);
      if (!enrollment) return;
      enrollment.assignments.filter((a) => !a.activatedAt).forEach((a) => {
        activateCourse(u.id, a.courseId, date, groupId);
      });
    });
  };

  return {
    localUsers,
    addCoursesToMember,
    addCoursesToGroup,
    addMemberToGroup,
    activateCourse,
    extendCourse,
    issueCertificate,
    toggleAssignment,
    handleActivateAll,
  };
}
