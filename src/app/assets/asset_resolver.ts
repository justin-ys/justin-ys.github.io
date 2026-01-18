import welcome from '@/app/assets/welcome.vtxt'

export default function resolveFromName(name: string) {
    if (name == 'welcome') {
        return welcome;
    }
}