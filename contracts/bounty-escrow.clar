(define-constant ERR-NOT-FOUND u100)
(define-constant ERR-ALREADY-ASSIGNED u101)
(define-constant ERR-ALREADY-RELEASED u102)
(define-constant ERR-ALREADY-REFUNDED u103)
(define-constant ERR-NOT-CREATOR u104)
(define-constant ERR-NO-DEVELOPER u105)
(define-constant ERR-NOT-DEVELOPER u106)
(define-constant ERR-DEADLINE-NOT-PASSED u107)
(define-constant ERR-STX-TRANSFER u108)
(define-constant ERR-DUPLICATE-ID u109)
(define-constant ERR-INVALID-AMOUNT u110)

(define-constant STATUS-OPEN "open")
(define-constant STATUS-RELEASED "released")
(define-constant STATUS-REFUNDED "refunded")

(define-map bounties { id: uint }
  {
    creator: principal,
    amount: uint,
    issue-link: (string-ascii 256),
    details: (string-ascii 256),
    developer: (optional principal),
    deadline: uint,
    status: (string-ascii 16),
    proof: (optional (string-ascii 256))
  }
)

(define-data-var bounty-ids (list 1000 uint) (list))

(define-read-only (get-bounty (bounty-id uint))
  (ok (map-get? bounties { id: bounty-id }))
)

(define-read-only (get-all-bounty-ids)
  (ok (var-get bounty-ids))
)

(define-public (create-bounty
  (bounty-id uint)
  (issue-link (string-ascii 256))
  (details (string-ascii 256))
  (developer (optional principal))
  (deadline uint)
  (amount-ustx uint)
)
  (begin
    (asserts! (> amount-ustx u0) (err ERR-INVALID-AMOUNT))
    (asserts! (is-none (map-get? bounties { id: bounty-id })) (err ERR-DUPLICATE-ID))
    (asserts! (is-ok (stx-transfer? amount-ustx tx-sender (as-contract tx-sender))) (err ERR-STX-TRANSFER))
    (map-set bounties { id: bounty-id }
      {
        creator: tx-sender,
        amount: amount-ustx,
        issue-link: issue-link,
        details: details,
        developer: developer,
        deadline: deadline,
        status: STATUS-OPEN,
        proof: none
      }
    )
    (var-set bounty-ids (concat (var-get bounty-ids) (list bounty-id)))
    (ok true)
  )
)

(define-public (apply-bounty (bounty-id uint))
  (let ((maybe (map-get? bounties { id: bounty-id })))
    (match maybe b
      (begin
        (match (get developer b) d
          (err ERR-ALREADY-ASSIGNED)
          (map-set bounties { id: bounty-id } (merge b { developer: (some tx-sender) }))
        )
        (ok true)
      )
      (err ERR-NOT-FOUND)
    )
  )
)

(define-public (submit-proof (bounty-id uint) (proof (string-ascii 256)))
  (let ((maybe (map-get? bounties { id: bounty-id })))
    (match maybe b
      (let ((maybe-dev (get developer b)))
        (asserts! (is-some maybe-dev) (err ERR-NO-DEVELOPER))
        (let ((dev (unwrap-panic maybe-dev)))
          (asserts! (is-eq tx-sender dev) (err ERR-NOT-DEVELOPER))
          (map-set bounties { id: bounty-id } (merge b { proof: (some proof) }))
          (ok true)
        )
      )
      (err ERR-NOT-FOUND)
    )
  )
)

(define-public (release-bounty (bounty-id uint))
  (let ((maybe (map-get? bounties { id: bounty-id })))
    (match maybe b
      (begin
        (asserts! (is-eq tx-sender (get creator b)) (err ERR-NOT-CREATOR))
        (asserts! (not (is-eq (get status b) STATUS-RELEASED)) (err ERR-ALREADY-RELEASED))
        (asserts! (not (is-eq (get status b) STATUS-REFUNDED)) (err ERR-ALREADY-REFUNDED))
        (let ((maybe-dev (get developer b)))
          (asserts! (is-some maybe-dev) (err ERR-NO-DEVELOPER))
          (let ((dev (unwrap-panic maybe-dev)))
            (asserts! (is-ok (as-contract (stx-transfer? (get amount b) tx-sender dev))) (err ERR-STX-TRANSFER))
            (map-set bounties { id: bounty-id } (merge b { status: STATUS-RELEASED, amount: u0 }))
            (ok true)
          )
        )
      )
      (err ERR-NOT-FOUND)
    )
  )
)

(define-public (refund-bounty (bounty-id uint))
  (let ((maybe (map-get? bounties { id: bounty-id })))
    (match maybe b
      (begin
        (asserts! (is-eq tx-sender (get creator b)) (err ERR-NOT-CREATOR))
        (asserts! (not (is-eq (get status b) STATUS-RELEASED)) (err ERR-ALREADY-RELEASED))
        (asserts! (not (is-eq (get status b) STATUS-REFUNDED)) (err ERR-ALREADY-REFUNDED))
        (asserts! (>= block-height (get deadline b)) (err ERR-DEADLINE-NOT-PASSED))
        (asserts! (is-ok (as-contract (stx-transfer? (get amount b) tx-sender (get creator b)))) (err ERR-STX-TRANSFER))
        (map-set bounties { id: bounty-id } (merge b { status: STATUS-REFUNDED, amount: u0 }))
        (ok true)
      )
      (err ERR-NOT-FOUND)
    )
  )
)