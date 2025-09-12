;; Bounty Escrow (Clarity)
;; - Principal ↔ GitHub username registry
;; - Create bounty (escrow STX)
;; - Apply to bounty (by registered username)
;; - Assign bounty (by creator)
;; - Submit PR (by assignee)
;; - Release bounty (by owner/oracle)
;; - Refund on deadline expiry (by creator)

(define-data-var owner principal tx-sender)
(define-data-var next-id uint u1)
(define-data-var bounty-ids (list 1000 uint) (list))

(define-constant ERR-USERNAME-TAKEN u100)
(define-constant ERR-ALREADY-REGISTERED u101)
(define-constant ERR-NOT-REGISTERED u102)
(define-constant ERR-NOT-CREATOR u103)
(define-constant ERR-NOT-OWNER u104)
(define-constant ERR-BOUNTY-NOT-FOUND u105)
(define-constant ERR-ALREADY-APPLIED u106)
(define-constant ERR-ALREADY-ASSIGNED u107)
(define-constant ERR-NOT-ASSIGNEE u108)
(define-constant ERR-INVALID-REWARD u109)
(define-constant ERR-STX-TRANSFER u110)
(define-constant ERR-DEADLINE-NOT-SET u111)
(define-constant ERR-DEADLINE-NOT-EXCEEDED u112)
(define-constant ERR-ALREADY-COMPLETED u113)
(define-constant ERR-ALREADY-REFUNDED u114)
(define-constant ERR-NOT-OPEN u115)
(define-constant ERR-NOT-SUBMITTED u116)
(define-constant ERR-NOT-ASSIGNED-YET u117)

(define-constant STATUS-OPEN "open")
(define-constant STATUS-ASSIGNED "assigned")
(define-constant STATUS-SUBMITTED "submitted")
(define-constant STATUS-COMPLETED "completed")
(define-constant STATUS-REFUNDED "refunded")

;; Principal -> GitHub username
(define-map p2u { who: principal } { username: (string-ascii 39) })
;; GitHub username -> Principal
(define-map u2p { username: (string-ascii 39) } { who: principal })

(define-map bounties { id: uint }
  {
    creator: principal,
    title: (string-utf8 120),
    description: (string-utf8 500),
    repo: (string-ascii 100),
    issue: uint,
    reward-ustx: uint,
    deadline-height: (optional uint),
    assignee: (optional (string-ascii 39)),
    pr-link: (optional (string-utf8 200)),
    status: (string-ascii 16),
    applicants: (list 200 (string-ascii 39))
  }
)

;; helpers
(define-read-only (contract-principal) (as-contract tx-sender))

(define-read-only (get-owner) (ok (var-get owner)))

(define-read-only (get-username (who principal))
  (match (map-get? p2u { who: who }) data
    (ok (some (get username data)))
    (ok none)
  )
)

(define-read-only (get-principal (username (string-ascii 39)))
  (match (map-get? u2p { username: username }) data
    (ok (some (get who data)))
    (ok none)
  )
)

(define-read-only (get-bounty (id uint))
  (ok (map-get? bounties { id: id }))
)

(define-read-only (get-all-bounty-ids)
  (ok (var-get bounty-ids))
)

(define-private (in-list (item (string-ascii 39)) (xs (list 200 (string-ascii 39))))
  (fold (lambda (x acc) (or acc (is-eq x item))) false xs)
)

;; 1. Register GitHub username
(define-public (register-github (username (string-ascii 39)))
  (begin
    (asserts! (is-none (map-get? p2u { who: tx-sender })) (err ERR-ALREADY-REGISTERED))
    (asserts! (is-none (map-get? u2p { username: username })) (err ERR-USERNAME-TAKEN))
    (map-set p2u { who: tx-sender } { username: username })
    (map-set u2p { username: username } { who: tx-sender })
    (print { event: "register", principal: tx-sender, username: username })
    (ok true)
  )
)

;; 2. Create bounty (escrows STX into contract)
(define-public (create-bounty
  (title (string-utf8 120))
  (description (string-utf8 500))
  (repo (string-ascii 100))
  (issue uint)
  (reward-ustx uint)
  (deadline (optional uint))
)
  (begin
    (asserts! (> reward-ustx u0) (err ERR-INVALID-REWARD))
    (match (as-contract (stx-transfer? reward-ustx (contract-caller) tx-sender)) transfer-ok
      (begin
        (let ((id (var-get next-id)))
          (var-set next-id (+ id u1))
          (map-set bounties { id: id }
            {
              creator: (contract-caller),
              title: title,
              description: description,
              repo: repo,
              issue: issue,
              reward-ustx: reward-ustx,
              deadline-height: deadline,
              assignee: none,
              pr-link: none,
              status: STATUS-OPEN,
              applicants: (list)
            }
          )
          (var-set bounty-ids (concat (var-get bounty-ids) (list id)))
          (print { event: "create", id: id, creator: (contract-caller), reward: reward-ustx })
          (ok id)
        )
      )
      transfer-err (err transfer-err)
    )
  )
)

;; 3. Apply to bounty (by registered username)
(define-public (apply-bounty (id uint))
  (let (
    (maybe-b (map-get? bounties { id: id }))
  )
    (match maybe-b b
      (begin
        (asserts! (is-eq (get status b) STATUS-OPEN) (err ERR-NOT-OPEN))
        (match (map-get? p2u { who: tx-sender }) data
          (let ((uname (get username data)))
            (asserts! (not (in-list uname (get applicants b))) (err ERR-ALREADY-APPLIED))
            (map-set bounties { id: id } (merge b { applicants: (concat (get applicants b) (list uname)) }))
            (print { event: "apply", id: id, username: uname })
            (ok true)
          )
          (err ERR-NOT-REGISTERED)
        )
      )
      (err ERR-BOUNTY-NOT-FOUND)
    )
  )
)

;; 4. Assign bounty (only creator)
(define-public (assign-bounty (id uint) (username (string-ascii 39)))
  (let ((maybe-b (map-get? bounties { id: id })))
    (match maybe-b b
      (begin
        (asserts! (is-eq tx-sender (get creator b)) (err ERR-NOT-CREATOR))
        (asserts! (is-eq (get status b) STATUS-OPEN) (err ERR-ALREADY-ASSIGNED))
        (asserts! (in-list username (get applicants b)) (err ERR-ALREADY-APPLIED))
        (map-set bounties { id: id } (merge b { assignee: (some username), status: STATUS-ASSIGNED }))
        (print { event: "assign", id: id, username: username })
        (ok true)
      )
      (err ERR-BOUNTY-NOT-FOUND)
    )
  )
)

;; 5. Submit PR (only assignee)
(define-public (submit-pr (id uint) (pr (string-utf8 200)))
  (let ((maybe-b (map-get? bounties { id: id })))
    (match maybe-b b
      (let ((maybe-assignee (get assignee b)))
        (asserts! (is-some maybe-assignee) (err ERR-NOT-ASSIGNED-YET))
        (let ((assignee (unwrap-panic maybe-assignee)))
          (match (map-get? p2u { who: tx-sender }) usr
            (let ((uname (get username usr)))
              (asserts! (is-eq uname assignee) (err ERR-NOT-ASSIGNEE))
              (asserts! (is-eq (get status b) STATUS-ASSIGNED) (err ERR-ALREADY-COMPLETED))
              (map-set bounties { id: id } (merge b { pr-link: (some pr), status: STATUS-SUBMITTED }))
              (print { event: "submit", id: id, username: uname, pr: pr })
              (ok true)
            )
            (err ERR-NOT-REGISTERED)
          )
        )
      )
      (err ERR-BOUNTY-NOT-FOUND)
    )
  )
)

;; 6. Release bounty (only owner/oracle); transfers to assignee principal
(define-public (release-bounty (id uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-OWNER))
    (let ((maybe-b (map-get? bounties { id: id })))
      (match maybe-b b
        (begin
          (asserts! (is-eq (get status b) STATUS-SUBMITTED) (err ERR-NOT-SUBMITTED))
          (let ((maybe-assignee (get assignee b)))
            (asserts! (is-some maybe-assignee) (err ERR-NOT-ASSIGNED-YET))
            (let ((uname (unwrap-panic maybe-assignee)))
              (match (map-get? u2p { username: uname }) rec
                (let ((to-principal (get who rec)))
                  (match (as-contract (stx-transfer? (get reward-ustx b) tx-sender to-principal)) transfer-ok
                    (begin
                      (map-set bounties { id: id } (merge b { status: STATUS-COMPLETED, reward-ustx: u0 }))
                      (print { event: "release", id: id, to: to-principal, username: uname })
                      (ok true)
                    )
                    transfer-err (err transfer-err)
                  )
                )
                (err ERR-NOT-REGISTERED)
              )
            )
          )
        )
        (err ERR-BOUNTY-NOT-FOUND)
      )
    )
  )
)

;; 7. Refund after deadline (creator only)
(define-public (refund-bounty (id uint))
  (let ((maybe-b (map-get? bounties { id: id })))
    (match maybe-b b
      (begin
        (asserts! (is-eq tx-sender (get creator b)) (err ERR-NOT-CREATOR))
        (asserts! (not (is-eq (get status b) STATUS-COMPLETED)) (err ERR-ALREADY-COMPLETED))
        (asserts! (not (is-eq (get status b) STATUS-REFUNDED)) (err ERR-ALREADY-REFUNDED))
        (let ((maybe-deadline (get deadline-height b)))
          (asserts! (is-some maybe-deadline) (err ERR-DEADLINE-NOT-SET))
          (let ((deadline (unwrap-panic maybe-deadline)))
            (asserts! (>= block-height deadline) (err ERR-DEADLINE-NOT-EXCEEDED))
            (match (as-contract (stx-transfer? (get reward-ustx b) tx-sender (get creator b))) transfer-ok
              (begin
                (map-set bounties { id: id } (merge b { status: STATUS-REFUNDED, reward-ustx: u0 }))
                (print { event: "refund", id: id, to: (get creator b) })
                (ok true)
              )
              transfer-err (err transfer-err)
            )
          )
        )
      )
      (err ERR-BOUNTY-NOT-FOUND)
    )
  )
)
