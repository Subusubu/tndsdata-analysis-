/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { Event } from 'vs/base/common/event';
import { createDecorator, ServiceIdentifier, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { GroupIdentifier } from 'vs/workbench/common/editor';
import { IEditorInput, IEditor, IEditorOptions } from 'vs/platform/editor/common/editor';

export const INextEditorGroupsService = createDecorator<INextEditorGroupsService>('nextEditorGroupsService');

export enum Direction {
	UP,
	DOWN,
	LEFT,
	RIGHT
}

export interface IMoveEditorOptions {
	index?: number;
	inactive?: boolean;
	preserveFocus?: boolean;
}

export interface INextEditorGroup {

	/**
	 * A unique identifier of this group that remains identical even if the
	 * group is moved to different locations.
	 */
	readonly id: GroupIdentifier;

	/**
	 * The active control is the currently visible control of the group.
	 */
	readonly activeControl: IEditor;

	/**
	 * The active editor is the currently visible editor of the group
	 * within the current active control.
	 */
	readonly activeEditor: IEditorInput;

	/**
	 * The number of opend editors in this group.
	 */
	readonly count: number;

	/**
	 * All opened editors in the group. There can only be one editor active.
	 */
	readonly editors: IEditorInput[];

	/**
	 * Emitted when this group is being disposed.
	 */
	readonly onWillDispose: Event<void>;

	/**
	 * Emitted when the active editor of this group changed.
	 */
	readonly onDidActiveEditorChange: Event<void>;

	/**
	 * Emitted when an editor of this group is closed.
	 */
	readonly onDidCloseEditor: Event<IEditorInput>;

	/**
	 * Returns the editor at a specific index of the group.
	 */
	getEditor(index: number): IEditorInput;

	/**
	 * Returns the index of the editor in the group or -1 if not opened.
	 */
	getIndexOfEditor(editor: IEditorInput): number;

	/**
	 * Open an editor in this group. The returned promise is resolved when the
	 * editor has finished loading.
	 */
	openEditor(editor: IEditorInput, options?: IEditorOptions): Thenable<void>;

	/**
	 * Find out if the provided editor is opened in the group.
	 *
	 * Note: An editor can be opened but not actively visible.
	 */
	isOpened(editor: IEditorInput): boolean;

	/**
	 * Find out if the provided editor is pinned in the group.
	 */
	isPinned(editor: IEditorInput): boolean;

	/**
	 * Find out if the provided editor is active in the group.
	 */
	isActive(editor: IEditorInput): boolean;

	/**
	 * Move an editor from this group either within this group or to another group.
	 */
	moveEditor(editor: IEditorInput, target: INextEditorGroup, options?: IMoveEditorOptions): void;

	/**
	 * Close an editor from the group. This may trigger a confirmation dialog if
	 * the editor is dirty and thus returns a promise as value.
	 *
	 * @param editor the editor to close, or the currently active editor
	 * if unspecified.
	 *
	 * @returns a promise when the editor is closed.
	 */
	closeEditor(editor?: IEditorInput): Thenable<void>;

	/**
	 * Set an editor to be pinned. A pinned editor is not replaced
	 * when another editor opens at the same location.
	 *
	 * @param editor the editor to pin, or the currently active editor
	 * if unspecified.
	 */
	pinEditor(editor?: IEditorInput): void;

	/**
	 * Move keyboard focus into the group.
	 */
	focus(): void;

	/**
	 * Invoke a function in the context of the services of this group.
	 */
	invokeWithinContext<T>(fn: (accessor: ServicesAccessor) => T): T;
}

export enum CopyKind {

	/**
	 * Copies all editors of the group from where to add to the new group.
	 */
	GROUP = 1,

	/**
	 * Copies the currently active editor of the group from where to add to the new group.
	 */
	EDITOR = 2
}

export interface INextEditorGroupsService {

	_serviceBrand: ServiceIdentifier<any>;

	/**
	 * An event for when the active editor group changes. The active editor
	 * group is the default location for new editors to open.
	 */
	readonly onDidActiveGroupChange: Event<INextEditorGroup>;

	/**
	 * An event for when a new group was added.
	 */
	readonly onDidAddGroup: Event<INextEditorGroup>;

	/**
	 * An event for when a group was removed.
	 */
	readonly onDidRemoveGroup: Event<INextEditorGroup>;

	/**
	 * An active group is the default location for new editors to open.
	 */
	readonly activeGroup: INextEditorGroup;

	/**
	 * All groups that are currently visible in the editor area.
	 */
	readonly groups: INextEditorGroup[];

	/**
	 * The number of editor groups that are currently opened.
	 */
	readonly count: number;

	/**
	 * Get all groups that are currently visible in the editor area optionally
	 * sorted by being most recent active.
	 */
	getGroups(sortByMostRecentlyActive?: boolean): INextEditorGroup[];

	/**
	 * Allows to convert a group identifier to a group.
	 */
	getGroup(identifier: GroupIdentifier): INextEditorGroup;

	/**
	 * Move keyboard focus into the provided group.
	 */
	focusGroup(group: INextEditorGroup | GroupIdentifier): INextEditorGroup;

	/**
	 * Set a group as active. An active group is the default location for new editors to open.
	 */
	activateGroup(group: INextEditorGroup | GroupIdentifier): INextEditorGroup;

	/**
	 * Add a new group to the editor area. A new group is added by splitting a provided one.
	 *
	 * @param fromGroup the group from which to split to add a new group
	 * @param direction the direction of where to split to
	 * @param copy optionally copy either the active editor open or all editors
	 */
	addGroup(fromGroup: INextEditorGroup | GroupIdentifier, direction: Direction, copy?: CopyKind): INextEditorGroup;

	/**
	 * Remove a group from the editor area.
	 */
	removeGroup(group: INextEditorGroup | GroupIdentifier): void;
}