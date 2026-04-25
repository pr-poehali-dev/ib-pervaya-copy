/**
 * ТОЧКА СОВМЕСТИМОСТИ — re-export всех доменных модулей
 *
 * Импортируйте данные напрямую из доменных файлов:
 *   import { COURSE_DIRECTIONS } from "@/data/courses"
 *   import { INITIAL_USERS }     from "@/data/users"
 *   import { TENANTS }           from "@/data/tenants"
 *   import { CERTIFICATES }      from "@/data/certificates"
 *   import { DEFAULT_ORG }       from "@/data/settings"
 *
 * Этот файл оставлен для обратной совместимости.
 */

export {
  COURSE_DIRECTIONS,
  ALL_COURSES,
} from "./courses";

export {
  ROLES,
  GROUPS,
  GROUPS_DATA,
  INITIAL_USERS,
  DEFAULT_SYSTEM_USERS,
} from "./users";

export {
  CLIENT_ORGANIZATIONS,
  TENANTS,
  SUBSCRIPTION_BALANCES,
  TENANT_COURSES,
} from "./tenants";

export {
  CERTIFICATES,
  STP_REQUESTS,
} from "./certificates";

export {
  DEFAULT_ORG,
  DEFAULT_EMAIL_SETTINGS,
  ORG_TYPES,
  OPF_TYPES,
  USER_ROLES_SYSTEM,
  EMAIL_TEMPLATES,
  GRADIENTS,
  USER_COLORS,
} from "./settings";
