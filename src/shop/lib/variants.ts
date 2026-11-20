export const containerNav = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 1 } //stagger children want for all child in a stack
    }
};
export const itemNav = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export const iconContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

export const iconItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};
