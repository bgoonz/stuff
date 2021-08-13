import { EntitySubscriberInterface } from "./EntitySubscriberInterface";
import { ObjectLiteral } from "../common/ObjectLiteral";
import { Subject } from "../persistence/Subject";
import { Connection } from "../connection/Connection";
import { EntityManager } from "../entity-manager/EntityManager";
/**
 * Broadcaster provides a helper methods to broadcast events to the subscribers.
 */
export declare class Broadcaster {
    private connection;
    constructor(connection: Connection);
    /**
     * Broadcasts "BEFORE_INSERT", "BEFORE_UPDATE", "BEFORE_REMOVE" events for all given subjects.
     */
    broadcastBeforeEventsForAll(entityManager: EntityManager, insertSubjects: Subject[], updateSubjects: Subject[], removeSubjects: Subject[]): Promise<void>;
    /**
     * Broadcasts "AFTER_INSERT", "AFTER_UPDATE", "AFTER_REMOVE" events for all given subjects.
     */
    broadcastAfterEventsForAll(entityManager: EntityManager, insertSubjects: Subject[], updateSubjects: Subject[], removeSubjects: Subject[]): Promise<void>;
    /**
     * Broadcasts "BEFORE_INSERT" event.
     * Before insert event is executed before entity is being inserted to the database for the first time.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    broadcastBeforeInsertEvent(manager: EntityManager, subject: Subject): Promise<void>;
    /**
     * Broadcasts "BEFORE_UPDATE" event.
     * Before update event is executed before entity is being updated in the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    broadcastBeforeUpdateEvent(manager: EntityManager, subject: Subject): Promise<void>;
    /**
     * Broadcasts "BEFORE_REMOVE" event.
     * Before remove event is executed before entity is being removed from the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    broadcastBeforeRemoveEvent(manager: EntityManager, subject: Subject): Promise<void>;
    /**
     * Broadcasts "AFTER_INSERT" event.
     * After insert event is executed after entity is being persisted to the database for the first time.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    broadcastAfterInsertEvent(manager: EntityManager, subject: Subject): Promise<void>;
    /**
     * Broadcasts "AFTER_UPDATE" event.
     * After update event is executed after entity is being updated in the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    broadcastAfterUpdateEvent(manager: EntityManager, subject: Subject): Promise<void>;
    /**
     * Broadcasts "AFTER_REMOVE" event.
     * After remove event is executed after entity is being removed from the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    broadcastAfterRemoveEvent(manager: EntityManager, subject: Subject): Promise<void>;
    /**
     * Broadcasts "AFTER_LOAD" event for all given entities, and their sub-entities.
     * After load event is executed after entity has been loaded from the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    broadcastLoadEventsForAll(target: Function | string, entities: ObjectLiteral[]): Promise<void>;
    /**
     * Broadcasts "AFTER_LOAD" event for the given entity and all its sub-entities.
     * After load event is executed after entity has been loaded from the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    broadcastLoadEvents(target: Function | string, entity: ObjectLiteral): Promise<void>;
    /**
     * Checks if subscriber's methods can be executed by checking if its don't listen to the particular entity,
     * or listens our entity.
     */
    protected isAllowedSubscriber(subscriber: EntitySubscriberInterface<any>, target: Function | string): boolean;
}
