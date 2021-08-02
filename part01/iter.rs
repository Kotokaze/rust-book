fn main() {
    let itr = Iter {
        current: 0,
        max: 10,
    };

    for i in itr {
        println!("{}", i);
    }
}

struct Iter {
    current: usize,
    max: usize,
}

impl Iterator for Iter {
    type Item = usize;

    fn next(&mut self) -> Option<Self::Item> {
        self.current += 1;

        if (self.current - 1 < self.max) {
            Some(self.current - 1)
        } else {
            None
        }
    }
}
