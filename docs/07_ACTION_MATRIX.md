# KWATE — Action Matrix

| Action | Route/UI | Actor | Reads | Writes | Validation | Permission | Audit | UI states |
|---|---|---|---|---|---|---|---|---|
| auth.signup | `/signup` | anonymous | auth config | users, profiles | email/password/name | public signup enabled | auth.signup | loading/success/error |
| auth.login | `/login` | anonymous | users | session | email/password | valid credentials | auth.login | loading/success/error |
| auth.logout | `/profile`, `/settings` | user | session | session | none | self | auth.logout | loading/success/error |
| auth.password_reset.request | `/forgot-password` | anonymous | auth config | reset token | email | no enumeration | auth.password_reset_requested | loading/success/error |
| post.list | `/`, `/search` | public | posts,categories,media | none | query params | public_active_only | none | loading/empty/error |
| post.get | `/post/[id]` | public/user | posts,media,profile | none | post id | active or owner/admin | post.view optional | loading/error |
| post.create | `/publish` | user | profile,pass | posts,post_media | post schema | authenticated | post.created | loading/success/error |
| post.update | future `/profile/posts` | owner | posts | posts | post schema | owner_only | post.updated | loading/success/error |
| post.delete_soft | future `/profile/posts` | owner | posts | posts.deleted_at | id | owner_only | post.deleted_soft | confirm/loading/success/error |
| contact.unlock | `/post/[id]` | user | post,pass,contact_unlocks | contact_unlocks | post id | pass_or_free_rule | contact.unlocked | loading/success/error |
| conversation.create | `/post/[id]` | user | post,profiles | conversations | participant ids | not self + allowed contact | conversation.created | loading/success/error |
| message.send | `/messages` | participant | conversation | messages | body | participant_only | message.sent | sending/sent/error |
| pass.checkout_start | `/pass` | user | selected plan | payment_sessions | plan id | authenticated | pass.checkout_started | loading/redirect/error |
| pass.activate | webhook | system | payment_sessions | passes | webhook payload | stripe signature | pass.activated | n/a |
| report.create | `/post/[id]` | user | target | reports | reason | authenticated | report.created | loading/success/error |
| admin.post.block | `/admin/posts` | admin | reports,posts | posts | reason | admin_only | admin.post_blocked | loading/success/error |
