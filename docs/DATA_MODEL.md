# Data Model

## 1. Design Principles

- 使用 `uuid` 作为主键，避免可枚举 ID。
- 所有业务表包含 `created_at` 和 `updated_at`。
- 状态字段采用明确枚举，避免模糊字符串。
- 重要状态切换写入审计日志。

## 2. Core Tables

### `profiles`

成员资料与平台角色。

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | 对应 `auth.users.id` |
| role | text | `member` or `admin` |
| status | text | `pending`, `active`, `suspended` |
| display_name | text | 平台展示名 |
| real_name | text | 可选，便于内部识别 |
| contact_wechat | text | 默认联系方式 |
| department | text | 可选 |
| join_year | int | 可选 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `listings`

闲置主表。

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | 主键 |
| seller_id | uuid | 关联 `profiles.id` |
| title | text | 标题 |
| description | text | 描述 |
| category | text | 如 `board`, `sensor`, `tool`, `device`, `other` |
| condition | text | 如 `new`, `like_new`, `used`, `for_parts` |
| price_cents | int | 价格，单位分 |
| contact_note | text | 覆盖默认联系方式的补充说明 |
| campus_area | text | 可选，线下交接地点偏好 |
| status | text | `draft`, `pending_review`, `published`, `reserved`, `completed`, `rejected`, `removed` |
| reject_reason | text | 驳回原因 |
| cover_image_path | text | Storage 对象路径 |
| published_at | timestamptz | 发布时间 |
| completed_at | timestamptz | 成交时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `listing_images`

闲置图片表。

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | 主键 |
| listing_id | uuid | 关联 `listings.id` |
| storage_path | text | Storage 对象路径 |
| alt_text | text | 可选 |
| sort_order | int | 显示顺序 |
| created_at | timestamptz | 创建时间 |

### `reservation_requests`

买家预约申请。

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | 主键 |
| listing_id | uuid | 关联 `listings.id` |
| buyer_id | uuid | 关联 `profiles.id` |
| message | text | 预约留言 |
| status | text | `pending`, `accepted`, `rejected`, `cancelled`, `closed` |
| handled_by | uuid | 由谁处理，通常为卖家 |
| handled_at | timestamptz | 处理时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `favorites`

成员收藏关系。

| Field | Type | Notes |
| --- | --- | --- |
| user_id | uuid | 关联 `profiles.id` |
| listing_id | uuid | 关联 `listings.id` |
| created_at | timestamptz | 创建时间 |

### `reports`

举报表。

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | 主键 |
| listing_id | uuid | 关联 `listings.id` |
| reporter_id | uuid | 举报人 |
| reason | text | 举报原因 |
| status | text | `open`, `resolved`, `dismissed` |
| resolution_note | text | 处理说明 |
| handled_by | uuid | 管理员 |
| handled_at | timestamptz | 处理时间 |
| created_at | timestamptz | 创建时间 |

### `audit_logs`

关键操作审计表。

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | 主键 |
| actor_id | uuid | 触发者 |
| action | text | 例如 `listing.approved` |
| target_type | text | 例如 `listing`, `report`, `profile` |
| target_id | uuid | 目标实体 ID |
| metadata | jsonb | 补充信息 |
| created_at | timestamptz | 创建时间 |

## 3. State Machines

### Listing Status

`draft -> pending_review -> published -> reserved -> completed`

允许的旁路状态：

- `pending_review -> rejected`
- `published -> removed`
- `reserved -> published`
- `reserved -> removed`

### Reservation Status

`pending -> accepted -> closed`

允许的旁路状态：

- `pending -> rejected`
- `pending -> cancelled`
- `accepted -> cancelled`

## 4. RLS Policy Outline

### `profiles`

- 用户可读取自己的资料。
- `active` 成员可读取其他 `active` 成员的公开资料字段。
- 管理员可读取和更新全部资料。

### `listings`

- 仅 `active` 成员可读取 `published`, `reserved`, `completed` 状态的闲置。
- 卖家可读取和更新自己的闲置。
- 管理员可读取和更新所有闲置。

### `listing_images`

- 图片的读权限跟随所属闲置。
- 图片的写权限仅限所属卖家和管理员。

### `reservation_requests`

- 买家可读取自己的预约。
- 卖家可读取指向自己闲置的预约。
- 管理员可读取所有预约。

### `favorites`

- 用户只能管理自己的收藏关系。

### `reports`

- 举报人可读取自己发起的举报处理结果。
- 管理员可读取与更新所有举报。

### `audit_logs`

- 仅管理员可读取。
- 仅服务端写入。

## 5. Suggested Indexes

- `listings(status, category, created_at desc)`
- `listings(seller_id, status)`
- `reservation_requests(listing_id, status)`
- `reports(status, created_at desc)`
- `favorites(user_id, created_at desc)`

## 6. Future Optional Tables

- `notifications`
- `listing_tags`
- `member_invites`
- `price_history`
