import welcome from '@/app/assets/welcome.vtxt'
import portfolio from '@/app/assets/portfolio.vtxt'

export default function resolveFromName(name: string) {
    if (name == 'welcome') {
        return welcome;
    }
    else if (name == 'portfolio') {
        return portfolio;
    }
}