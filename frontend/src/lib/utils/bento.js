const SPAN = {
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    6: 'lg:col-span-6'
};

export const planBento = (count) => {
    const spans = [];
    let remaining = count;
    let flip = false;

    while (remaining > 0) {
        if (remaining === 1) {
            spans.push(6);
            remaining = 0;
        } else if (remaining === 2 || remaining === 4) {
            spans.push(...(flip ? [2, 4] : [4, 2]));
            flip = !flip;
            remaining -= 2;
        } else {
            spans.push(2, 2, 2);
            remaining -= 3;
        }
    }

    return spans.map((value) => ({ span: SPAN[value], wide: value >= 4 }));
};