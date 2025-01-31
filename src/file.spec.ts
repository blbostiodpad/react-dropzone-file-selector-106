// tslint:disable: forin
import {COMMON_MIME_TYPES, toFileWithPath} from './file';

describe('toFile()', () => {
    it('should be an instance of a File', () => {
        const file = new File([], 'test.json');
        const fileWithPath = toFileWithPath(file);
        expect(fileWithPath).toBeInstanceOf(File);
    });

    it('has all the File options', () => {
        const type = 'application/json';
        const opts: FilePropertyBag = {type};
        const file = new File([], 'test.json', opts);
        const fileWithPath = toFileWithPath(file);
        expect(fileWithPath.type).toBe(type);
    });

    it('does not overwrite {path} if it exists', () => {
        const fullPath = '/Users/test/Desktop/test/test.json';
        const path = '/test/test.json';
        const file = new File([], 'test.json');
        // @ts-ignore
        file.path = fullPath; // this is set only in the case of an electron app
        const fileWithPath = toFileWithPath(file, path);
        expect(fileWithPath.path).toBe(fullPath);
    });

    it('sets the {path} if provided', () => {
        const path = '/test/test.json';
        const file = new File([], 'test.json');
        const fileWithPath = toFileWithPath(file, path);
        expect(fileWithPath.path).toBe(path);
    });

    test('{path} is enumerable', () => {
        const path = '/test/test.json';
        const file = new File([], 'test.json');
        const fileWithPath = toFileWithPath(file, path);

        expect(Object.keys(fileWithPath)).toContain('path');

        const keys: string[] = [];
        for (const key in fileWithPath) {
            keys.push(key);
        }

        expect(keys).toContain('path');
    });

    it('uses the File {name} as {path} if not provided', () => {
        const name = 'test.json';
        const file = new File([], name);
        const fileWithPath = toFileWithPath(file);
        expect(fileWithPath.path).toBe(`./${name}`);
    });

    it('uses the File {webkitRelativePath} as {path} if it exists', () => {
        const name = 'test.json';
        const path = 'test/test.json';
        const file = new File([], name);
        Object.defineProperty(file, 'webkitRelativePath', {
            value: path
        });
        const fileWithPath = toFileWithPath(file);
        expect(fileWithPath.path).toBe(path);
    });

    it('sets the {relativePath} if provided without overwriting {path}', () => {
        const fullPath = '/Users/test/Desktop/test/test.json';
        const path = '/test/test.json';
        const file = new File([], 'test.json');

        // @ts-expect-error
        file.path = fullPath;
        const fileWithPath = toFileWithPath(file, path);
        expect(fileWithPath.path).toBe(fullPath);
        expect(fileWithPath.relativePath).toBe(path);
    });

    test('{relativePath} is enumerable', () => {
        const path = '/test/test.json';
        const file = new File([], 'test.json');
        const fileWithPath = toFileWithPath(file, path);

        expect(Object.keys(fileWithPath)).toContain('relativePath');

        const keys: string[] = [];
        for (const key in fileWithPath) {
            keys.push(key);
        }

        expect(keys).toContain('relativePath');
    });

    it('uses the File {webkitRelativePath} as {relativePath} if it exists', () => {
        const name = 'test.json';
        const path = 'test/test.json';
        const file = new File([], name);
        Object.defineProperty(file, 'webkitRelativePath', {
            value: path
        });
        const fileWithPath = toFileWithPath(file);
        expect(fileWithPath.relativePath).toBe(path);
    });

    it('sets the {type} from extension', () => {
        const types = Array.from(COMMON_MIME_TYPES.values());
        const files = Array.from(COMMON_MIME_TYPES.keys())
            .map(ext => new File([], `test.${ext}`))
            .map(f => toFileWithPath(f));

        for (const file of files) {
            expect(types.includes(file.type)).toBe(true);
        }
    });

    test('{type} is enumerable', () => {
        const file = new File([], 'test.gif');
        const fileWithPath = toFileWithPath(file);

        expect(Object.keys(fileWithPath)).toContain('type');

        const keys: string[] = [];
        for (const key in fileWithPath) {
            keys.push(key);
        }

        expect(keys).toContain('type');
    });

    it('sets the {type} from extension regardless of case', () => {
        const types = Array.from(COMMON_MIME_TYPES.values());
        const files = Array.from(COMMON_MIME_TYPES.keys())
            .map(key => key.toUpperCase())
            .map(ext => new File([], `test.${ext}`))
            .map(f => toFileWithPath(f));

        for (const file of files) {
            expect(types.includes(file.type)).toBe(true);
        }
    });

    it('should behave like a File', done => {
        const data = {ping: true};
        const json = JSON.stringify(data);
        const file = new File([json], 'test.json');
        const fileWithPath = toFileWithPath(file);

        const reader = new FileReader();
        reader.onload = evt => {
            const {result} = evt.target as any;
            try {
                const d = JSON.parse(result);
                expect(d).toEqual(data);
                done();
            } catch (e) {
                done.fail(e as Error);
            }
        };

        reader.readAsText(fileWithPath);
    });

    it('sets the {handle} if provided', () => {
        const path = '/test/test.json';
        const file = new File([], 'test.json');
        const fileWithHandle = toFileWithPath(file, path, fsHandleFromFile(file));
        expect(fileWithHandle.handle).toBeDefined();
        expect(fileWithHandle.handle?.name).toEqual(file.name);
    });

    test('{handle} is enumerable', () => {
        const path = '/test/test.json';
        const file = new File([], 'test.json');
        const fileWithHandle = toFileWithPath(file, path, fsHandleFromFile(file));

        expect(Object.keys(fileWithHandle)).toContain('handle');

        const keys: string[] = [];
        for (const key in fileWithHandle) {
            keys.push(key);
        }

        expect(keys).toContain('handle');
    });

});

function fsHandleFromFile(f: File): FileSystemHandle {
    return {
        kind: 'file',
        name: f.name,
        isSameEntry() {
            return Promise.resolve(false)
        }
    }
}
