// Promise Membership Proof
// Proves: a promise with specific properties exists in a network
// without revealing the promise content.
//
// Public inputs (visible to verifier):
//   network_root    — Poseidon Merkle root of the promise network
//   status_predicate — The status being claimed (e.g., verified=1)
//   domain_hash     — The domain being claimed (0 = any domain)
//
// Private inputs (witness, known only to prover):
//   promise_hash    — Poseidon hash of the full promise
//   status          — Actual status of the promise
//   domain          — Actual domain hash of the promise
//   merkle_path     — Sibling hashes on the path to root
//   merkle_indices  — Left/right indicators for each level

use dep::std;

// Merkle tree depth — supports up to 2^5 = 32 promises per network
// Increase for larger networks
global DEPTH: u32 = 5;

fn main(
    // Public inputs
    network_root: pub Field,
    status_predicate: pub Field,
    domain_hash: pub Field,  // 0 means "any domain"

    // Private inputs (witness)
    promise_hash: Field,
    status: Field,
    domain: Field,
    merkle_path: [Field; DEPTH],
    merkle_indices: [u1; DEPTH],
) {
    // 1. Verify status matches predicate
    assert(status == status_predicate, "Status does not match predicate");

    // 2. Verify domain matches (if specified)
    if domain_hash != 0 {
        assert(domain == domain_hash, "Domain does not match");
    }

    // 3. Verify promise is in the Merkle tree
    // Reconstruct root from leaf + path
    let mut current = promise_hash;
    for i in 0..DEPTH {
        let sibling = merkle_path[i];
        if merkle_indices[i] == 0 {
            // Current node is left child
            current = std::hash::poseidon::bn254::hash_2([current, sibling]);
        } else {
            // Current node is right child
            current = std::hash::poseidon::bn254::hash_2([sibling, current]);
        }
    }

    // 4. Check reconstructed root matches public root
    assert(current == network_root, "Merkle proof invalid");
}
