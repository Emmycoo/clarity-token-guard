;; TokenGuard
;; Track token metrics and performance

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-price (err u101))

;; Data structures
(define-map token-metrics
    { timestamp: uint }
    {
        total-supply: uint,
        holder-count: uint,
        transfer-volume: uint,
        price: uint
    }
)

(define-map holder-stats
    { holder: principal }
    {
        balance: uint,
        last-active: uint
    }
)

;; Data variables
(define-data-var current-holders uint u0)
(define-data-var total-volume uint u0)
(define-data-var last-price uint u0)
(define-data-var metrics-count uint u0)

;; Public functions

;; Record new token metrics
(define-public (record-metrics (total-supply uint) (holders uint) (volume uint) (price uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (> price u0) err-invalid-price)
        
        (map-set token-metrics
            { timestamp: block-height }
            {
                total-supply: total-supply,
                holder-count: holders,
                transfer-volume: volume,
                price: price
            }
        )
        
        (var-set current-holders holders)
        (var-set total-volume (+ (var-get total-volume) volume))
        (var-set last-price price)
        (var-set metrics-count (+ (var-get metrics-count) u1))
        
        (ok true)
    )
)

;; Update holder statistics
(define-public (update-holder-stats (holder principal) (balance uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        
        (map-set holder-stats
            { holder: holder }
            {
                balance: balance,
                last-active: block-height
            }
        )
        
        (ok true)
    )
)

;; Read only functions

(define-read-only (get-current-stats)
    (ok {
        holders: (var-get current-holders),
        volume: (var-get total-volume),
        price: (var-get last-price),
        metrics-count: (var-get metrics-count)
    })
)

(define-read-only (get-metrics-at (timestamp uint))
    (map-get? token-metrics { timestamp: timestamp })
)

(define-read-only (get-holder-info (holder principal))
    (map-get? holder-stats { holder: holder })
)

;; Calculate average price
(define-read-only (get-average-price (start-time uint) (end-time uint))
    (let (
        (start-metrics (map-get? token-metrics { timestamp: start-time }))
        (end-metrics (map-get? token-metrics { timestamp: end-time }))
    )
    (if (and start-metrics end-metrics)
        (ok (/ (+ (get price start-metrics) (get price end-metrics)) u2))
        (ok u0)
    ))
)